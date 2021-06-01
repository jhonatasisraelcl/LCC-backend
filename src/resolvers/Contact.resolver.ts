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
import { listContactsUseCase } from '../Modules/Bitrix/usecases/ListContacts';
import BitrixDeal from '../Schemas/BitrixDeal';
import GetContactsResponse from '../Schemas/GetContactsResponse';
import CreateContactService from '../Services/CreateContactService';
import CreateDealService from '../Services/CreateDealService';
import CreateVehicleDealService from '../Services/CreateVehicularDealService';
import GetDealService from '../Services/GetDealService';
import { AddContactInput } from './types/Contact/AddContactInput';
import { AddVehicularCreditContactInput } from './types/Contact/AddVehicularCreditContactInput';
import GetContactsInput from './types/Contact/GetContactsInput';

@Resolver()
class ContactResolver {
  @Mutation(() => BitrixDeal)
  async addVehicularCreditContact(
    @Arg('data')
    {
      birthday,
      clientSituation,
      cnpj,
      companyID,
      contactMonthlyIncome,
      cpf,
      email,
      name,
      phone,
      vehicleManufacturedDate,
      vehicleModel,
      vehicleName,
      vehicleTargetValue,
      vehicleValue,
      vehicularCreditType,
      opportunityValue,
      address,
    }: AddVehicularCreditContactInput,
  ): Promise<BitrixDeal> {
    const emailInLoweCase = email.toLowerCase();

    const createContactService = new CreateContactService();
    const contactID = await createContactService.execute({
      companyID,
      name,
      email: emailInLoweCase,
      cpf,
      cnpj,
      phone,
      birthday,
    });

    const createVehicleDealService = new CreateVehicleDealService();
    const vehicleDealID = await createVehicleDealService.execute({
      clientSituation,
      companyID,
      contactID,
      contactMonthlyIncome,
      name,
      opportunityValue,
      vehicleManufacturedDate,
      vehicleModel,
      vehicleName,
      vehicleTargetValue,
      vehicleValue,
      vehicularCreditType,
      address,
    });
    const getDealService = new GetDealService();
    const deal = await getDealService.execute({
      id: vehicleDealID,
      companyID,
    });

    return deal;
  }

  @Mutation(() => BitrixDeal)
  async addContact(
    @Arg('data')
    {
      name,
      email,
      personType,
      cpf,
      cnpj,
      phone,
      creditType,
      address,
      propertyValue,
      opportunityValue,
      term,
      propertyType,
      companyID,
    }: AddContactInput,
  ): Promise<BitrixDeal> {
    const emailInLoweCase = email.toLowerCase();

    const createContactService = new CreateContactService();
    const contactID = await createContactService.execute({
      companyID,
      name,
      email: emailInLoweCase,
      personType,
      cpf,
      cnpj,
      phone,
    });

    const createDealService = new CreateDealService();
    const dealID = await createDealService.execute({
      name,
      companyID,
      contactID,
      opportunityValue,
      term,
      phone,
      email: emailInLoweCase,
      propertyValue,
      propertyType,
      personType,
      address,
      creditType,
    });

    const getDealService = new GetDealService();
    const deal = await getDealService.execute({
      id: dealID,
      companyID,
    });

    return deal;
  }

  @Query(() => GetContactsResponse)
  @UseMiddleware(AuthenticatedChecker)
  async getContacts(
    @Ctx()
    ctx: ContextData,
    @Arg('data') { page }: GetContactsInput,
  ): Promise<GetContactsResponse> {
    const { id: companyID } = ctx;
    const response = await listContactsUseCase.execute({
      companyID,
      page,
    });
    return response;
  }
}

export default ContactResolver;
