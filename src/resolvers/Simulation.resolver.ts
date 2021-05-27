import {
  Arg,
  Mutation,
  Resolver,
  Query,
  UseMiddleware,
  Ctx,
} from 'type-graphql';
import { ContextData } from '../Context/context';
import AuthenticatedChecker from '../middlewares/AuthenticatedChecker';
import Installment from '../Schemas/Installment';
import SELICRate from '../Schemas/SELICRate';
import Simulation from '../Schemas/Simulation';
import GetSELICRateService from '../Services/bcb/GetSELICRateService';
import CreateSimulationService from '../Services/Simulations/CreateSimulationService';
import DeleteSimulationService from '../Services/Simulations/DeleteSimulationService';
import GetPriceTableSimulationService from '../Services/Simulations/GetPriceTableSimulationService';
import GetSACTableSimulationService from '../Services/Simulations/GetSACTableSimulationService';
import GetSimulationsService from '../Services/Simulations/GetSimulationsService';
import CreateSimulationInput from './types/Simulation/CreateSimulationInput';
import DeleteSimulationInput from './types/Simulation/DeleteSimulationInput';
import GetSimulationInstallmentsInput from './types/Simulation/GetSimulationInstallmentsInput';

@Resolver()
class SimulationsResolver {
  @Mutation(() => [Installment])
  @UseMiddleware(AuthenticatedChecker)
  getPriceTableSimulation(
    @Arg('data', { validate: true })
    {
      loanAmount,
      loanInterest,
      numberOfInstallments,
    }: GetSimulationInstallmentsInput,
  ): Installment[] {
    const getPriceTableSimulationService = new GetPriceTableSimulationService();
    const priceTableInstallments = getPriceTableSimulationService.execute({
      loanAmount,
      loanInterest: loanInterest / 100,
      numberOfInstallments,
    });
    return priceTableInstallments;
  }

  @Mutation(() => [Installment])
  getSACSimulation(
    @Arg('data', { validate: true })
    {
      loanAmount,
      loanInterest,
      numberOfInstallments,
    }: GetSimulationInstallmentsInput,
  ): Installment[] {
    const getSACTableSimulationService = new GetSACTableSimulationService();
    const SACInstallments = getSACTableSimulationService.execute({
      loanAmount,
      loanInterest: loanInterest / 100,
      numberOfInstallments,
    });
    return SACInstallments;
  }

  @Query(() => SELICRate)
  async getSELICRate(): Promise<SELICRate> {
    const getSELICRateService = new GetSELICRateService();
    const selicRate = await getSELICRateService.execute();
    return selicRate;
  }

  @Query(() => [Simulation], { nullable: true })
  @UseMiddleware(AuthenticatedChecker)
  async getSimulations(
    @Ctx()
    context: ContextData,
  ): Promise<Simulation[]> {
    const { id: companyID } = context;
    const getSimulationsService = new GetSimulationsService();
    const simulations = await getSimulationsService.execute({
      companyID,
    });
    return simulations;
  }

  @Mutation(() => Simulation)
  @UseMiddleware(AuthenticatedChecker)
  async createSimulation(
    @Ctx()
    context: ContextData,
    @Arg('data', { validate: true })
    {
      value,
      numberOfInstallments,
      name,
      cpf,
      email,
      phone,
      dealCategoryID,
      dealProductID,
      amortizationType,
      personType,
    }: CreateSimulationInput,
  ): Promise<Simulation> {
    const { id: companyID } = context;
    const createSimulationService = new CreateSimulationService();
    const simulation = await createSimulationService.execute({
      companyID,
      cpf,
      email,
      name,
      numberOfInstallments,
      phone,
      value,
      dealCategoryID,
      dealProductID,
      amortizationType,
      personType,
    });
    return simulation;
  }

  @Mutation(() => Simulation, { nullable: true })
  @UseMiddleware(AuthenticatedChecker)
  async deleteSimulation(
    @Ctx()
    context: ContextData,
    @Arg('data')
    { id }: DeleteSimulationInput,
  ): Promise<Simulation> {
    const { id: companyID } = context;
    const deleteSimulationService = new DeleteSimulationService();
    const simulation = await deleteSimulationService.execute({
      companyID,
      simulationID: id,
    });
    return simulation;
  }
}

export default SimulationsResolver;
