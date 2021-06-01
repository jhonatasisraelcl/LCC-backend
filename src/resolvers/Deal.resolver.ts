import {
  Resolver,
  Query,
  Arg,
  Ctx,
  UseMiddleware,
  Mutation,
} from 'type-graphql';
import { ContextData } from '../Context/context';
import AuthenticatedChecker from '../middlewares/AuthenticatedChecker';
import BitrixDealCategory from '../Schemas/BitrixDealCategory';
import GetDealsResponse from '../Schemas/GetDealsResponse';
import GetDealService from '../Services/GetDealService';
import GetDealsService from '../Services/GetDealsService';
import GetVehicularDealsService from '../Services/GetVehicularDealsService';
import GetDealInput from './types/Deal/GetDealInput';
import GetDealsInput from './types/Deal/GetDealsInput';
import BitrixDeal from '../Schemas/BitrixDeal';
import DealCategory from '../Schemas/DealCategory';
import PermissionRequired from '../middlewares/PermissionRequired';
import permissions from '../config/permissions';
import CreateDealCategoryInput from './types/Deal/CreateDealCategoryInput';
import CreateDealCategoryService from '../Services/deals/dealsCategories/CreateDealCategoryService';
import GetBitrixDealsCategoriesService from '../Services/deals/dealsCategories/GetBitrixDealsCategoriesService';
import GetDealsCategoriesService from '../Services/deals/dealsCategories/GetDealsCategoriesService';
import GetBitrixDealFieldsService from '../Services/deals/dealsCategories/GetBitrixDealFieldsService';
import BitrixDealField from '../Schemas/BitrixDealField';
import DeleteDealCategoryInput from './types/Deal/DeleteDealCategoryInput';
import DeleteDealCategoryService from '../Services/deals/dealsCategories/DeleteDealCategoryService';
import BitrixDealFieldItem from '../Schemas/BitrixDealFieldItem';
import GetBitrixDealFieldItemsInput from './types/Deal/GetBitrixDealFieldItemsInput';
import GetBitrixDealFieldItemsService from '../Services/deals/dealsCategories/GetBitrixDealFieldItemsService';
import SwitchDealCategoryVisibilityInput from './types/Deal/SwitchDealCategoryVisibilityInput';
import SwitchDealCategoryVisibilityService from '../Services/deals/dealsCategories/SwitchDealCategoryVisibilityService';
import GetDealsUpdatedInput from './types/Deal/GetDealsUpdatedInput';
import DealCategoryStage from '../Schemas/DealCategoryStage';
import GetDealCategoryStageInput from './types/Deal/GetDealCategoryStagesInput';
import GetDealCategoryStagesService from '../Services/deals/dealsCategories/GetDealCategoryStagesService';
import { listBitrixDealsByCompanyIDUseCase } from '../Modules/Bitrix/usecases/ListDeals';

@Resolver()
class DealsResolver {
  // TODO: Remove it
  @Query(() => BitrixDeal, { nullable: true, description: 'Deprecated' })
  @UseMiddleware(AuthenticatedChecker)
  async getDeal(
    @Ctx()
    ctx: ContextData,
    @Arg('data')
    { dealID }: GetDealInput,
  ): Promise<BitrixDeal> {
    const { id: companyID } = ctx;
    const getDealService = new GetDealService();
    const deal = getDealService.execute({
      id: dealID,
      companyID,
    });
    return deal;
  }

  // TODO: update it
  @Query(() => GetDealsResponse, { nullable: true })
  @UseMiddleware(AuthenticatedChecker)
  async getDeals(
    @Ctx()
    ctx: ContextData,
    @Arg('data')
    { page }: GetDealsInput,
  ): Promise<GetDealsResponse> {
    const { id: companyID } = ctx;
    const getDealsService = new GetDealsService();
    const dealsGathered = await getDealsService.execute({
      page,
      companyID,
    });
    return dealsGathered;
  }

  // TODO: change it on frontend and backend
  @Query(() => GetDealsResponse, {
    nullable: true,
    description: 'The company should use this resolver to get your deals',
  })
  @UseMiddleware(AuthenticatedChecker)
  async getDealsUpdated(
    @Ctx()
    ctx: ContextData,
    @Arg('data')
    { dealCategoryID, page }: GetDealsUpdatedInput,
  ): Promise<GetDealsResponse> {
    const { id: companyID } = ctx;

    const deals = await listBitrixDealsByCompanyIDUseCase.execute({
      companyID,
      dealCategoryID,
      page,
    });
    return deals;
  }

  @Query(() => GetDealsResponse, { nullable: true })
  @UseMiddleware(AuthenticatedChecker)
  async getVehicularDeals(
    @Ctx()
    ctx: ContextData,
    @Arg('data')
    { page }: GetDealsInput,
  ): Promise<GetDealsResponse> {
    const { id: companyID } = ctx;
    const getVehicularDealsService = new GetVehicularDealsService();
    const dealsGathered = await getVehicularDealsService.execute({
      page,
      companyID,
    });
    return dealsGathered;
  }

  @Query(() => [BitrixDealCategory])
  @UseMiddleware(AuthenticatedChecker, PermissionRequired(permissions.admin))
  async getBitrixDealsCategories(): Promise<BitrixDealCategory[]> {
    const getBitrixDealsCategoriesService = new GetBitrixDealsCategoriesService();
    const bitrixDealsCategories = await getBitrixDealsCategoriesService.execute();
    return bitrixDealsCategories;
  }

  @Mutation(() => DealCategory)
  @UseMiddleware(AuthenticatedChecker, PermissionRequired(permissions.admin))
  async createDealCategory(
    @Arg('data')
    {
      bitrix_id,
      isVisible,
      name,
      bitrixProductsField,
      isInDevelopment,
      url,
    }: CreateDealCategoryInput,
  ): Promise<DealCategory> {
    const createDealCategoryService = new CreateDealCategoryService();
    const dealCategory = await createDealCategoryService.execute({
      bitrix_id,
      isVisible,
      name,
      bitrixProductsField,
      isInDevelopment,
      url,
    });
    return dealCategory;
  }

  @Mutation(() => DealCategory)
  @UseMiddleware(AuthenticatedChecker, PermissionRequired(permissions.admin))
  async deleteDealCategory(
    @Arg('data')
    { id }: DeleteDealCategoryInput,
  ): Promise<DealCategory> {
    const deleteDealCategoryService = new DeleteDealCategoryService();
    const dealCategory = await deleteDealCategoryService.execute({
      dealCategoryID: id,
    });
    return dealCategory;
  }

  @Query(() => [DealCategory], { nullable: true })
  async getDealsCategories(): Promise<DealCategory[]> {
    const getDealsCategoriesService = new GetDealsCategoriesService();
    const dealsCategories = await getDealsCategoriesService.execute();
    return dealsCategories;
  }

  @Query(() => [BitrixDealField], { nullable: true })
  @UseMiddleware(AuthenticatedChecker, PermissionRequired(permissions.admin))
  async getBitrixDealFields(): Promise<BitrixDealField[]> {
    const getBitrixDealFieldsService = new GetBitrixDealFieldsService();
    const fields = await getBitrixDealFieldsService.execute();
    return fields;
  }

  @Query(() => [DealCategoryStage], { nullable: true })
  async getDealCategoryStages(
    @Arg('data')
    { dealCategoryID }: GetDealCategoryStageInput,
  ): Promise<DealCategoryStage[]> {
    const getDealCategoryStagesService = new GetDealCategoryStagesService();
    const dealCategoryStages = await getDealCategoryStagesService.execute({
      dealCategoryID,
    });
    return dealCategoryStages;
  }

  @Query(() => [BitrixDealFieldItem], { nullable: true })
  async getBitrixDealFieldItems(
    @Arg('data')
    { dealFieldKey }: GetBitrixDealFieldItemsInput,
  ): Promise<BitrixDealFieldItem[]> {
    const getBitrixDealFieldItemsService = new GetBitrixDealFieldItemsService();
    const bitrixDealFieldItems = await getBitrixDealFieldItemsService.execute({
      dealFieldKey,
    });
    return bitrixDealFieldItems;
  }

  @Mutation(() => DealCategory)
  @UseMiddleware(AuthenticatedChecker, PermissionRequired(permissions.admin))
  async switchDealCategoryVisibility(
    @Arg('data')
    { dealCategoryID }: SwitchDealCategoryVisibilityInput,
  ): Promise<DealCategory> {
    const switchDealCategoryVisibilityService = new SwitchDealCategoryVisibilityService();
    const dealCategory = await switchDealCategoryVisibilityService.execute({
      dealCategoryID,
    });
    return dealCategory;
  }
}

export default DealsResolver;
