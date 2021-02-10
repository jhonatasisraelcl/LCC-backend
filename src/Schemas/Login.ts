import { Field, ObjectType } from "type-graphql";
import Company from "./Company";

@ObjectType({description:'Login Schema'})
export default class Login {
  @Field()
  token: string

  @Field(() => Company)
  company: Company
}
