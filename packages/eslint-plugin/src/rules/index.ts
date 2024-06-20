import valign from "./valign";
import align from "./align";
import unrecommendedTags from "./unrecommended-tags";
import recommendedAttrs from "./recommended-attr";
import { RuleModule } from "../models";
import htmlEntities from "./htmlEntities";

const rules: Record<string, RuleModule> = {
    "valign": valign,
    "align": align,
    "unrecommended-tags": unrecommendedTags,
    "recommended-attrs": recommendedAttrs,
    "html-entities": htmlEntities
}

export default rules;