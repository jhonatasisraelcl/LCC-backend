import DealCategoryModel from '../../../Entities/DealCategory';
import DealCategory from '../../../Schemas/DealCategory';

interface Request {
  dealCategoryID: string;
}

class SwitchDealCategoryVisibilityService {
  public async execute({ dealCategoryID }: Request): Promise<DealCategory> {
    const dealCategory = await DealCategoryModel.findById(dealCategoryID);
    if (!dealCategory) {
      throw new Error('Deal category not found');
    }
    dealCategory.isVisible = !dealCategory.isVisible;
    await dealCategory.save();
    return dealCategory;
  }
}

export default SwitchDealCategoryVisibilityService;
