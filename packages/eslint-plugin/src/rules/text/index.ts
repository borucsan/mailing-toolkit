import { RuleModule } from "../../models";
import htmlEntities from "./no-unencoded-entities";

export default  {
    "text-on-unencoded-entities": htmlEntities
} as Record<string, RuleModule>;
