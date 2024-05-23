import { AttributeKeyNode, AttributeNode, AttributeValueNode, AttributeValueWrapperEndNode, AttributeValueWrapperStartNode, CloseScriptTagNode, CloseStyleTagNode, CloseTagNode, CommentCloseNode, CommentContentNode, CommentNode, CommentOpenNode, Context, DoctypeAttributeNode, DoctypeAttributeValueNode, DoctypeAttributeWrapperEnd, DoctypeAttributeWrapperStart, DoctypeCloseNode, DoctypeNode, DoctypeOpenNode, OpenScriptTagEndNode, OpenScriptTagStartNode, OpenStyleTagEndNode, OpenStyleTagStartNode, OpenTagEndNode, OpenTagStartNode, ProgramNode, ScriptTagContentNode, ScriptTagNode, StyleTagContentNode, StyleTagNode, TagNode, TextNode } from "@html-eslint/eslint-plugin/lib/types";
import { Rule } from "eslint";

export interface RuleListener {
    Program?: (node: ProgramNode) => void;
    AttributeKey?: (node: AttributeKeyNode) => void;
    Text?: (node: TextNode) => void;
    Tag?: (node: TagNode) => void;
    OpenTagStart?: (node: OpenTagStartNode) => void;
    OpenTagEnd?: (node: OpenTagEndNode) => void;
    CloseTag?: (node: CloseTagNode) => void;
    Attribute?: (node: AttributeNode) => void;
    AttributeValue?: (node: AttributeValueNode) => void;
    AttributeValueWrapperEnd?: (node: AttributeValueWrapperEndNode) => void;
    AttributeValueWrapperStart?: (node: AttributeValueWrapperStartNode) => void;
    ScriptTag?: (node: ScriptTagNode) => void;
    OpenScriptTagStart?: (node: OpenScriptTagStartNode) => void;
    CloseScriptTag?: (node: CloseScriptTagNode) => void;
    OpenScriptTagEnd?: (node: OpenScriptTagEndNode) => void;
    ScriptTagContent?: (node: ScriptTagContentNode) => void;
    StyleTag?: (node: StyleTagNode) => void;
    OpenStyleTagStart?: (node: OpenStyleTagStartNode) => void;
    OpenStyleTagEnd?: (node: OpenStyleTagEndNode) => void;
    StyleTagContent?: (node: StyleTagContentNode) => void;
    CloseStyleTag?: (node: CloseStyleTagNode) => void;
    Comment?: (node: CommentNode) => void;
    CommentOpen?: (node: CommentOpenNode) => void;
    CommentClose?: (node: CommentCloseNode) => void;
    CommentContent?: (node: CommentContentNode) => void;
    Doctype?: (node: DoctypeNode) => void;
    DoctypeOpen?: (node: DoctypeOpenNode) => void;
    DoctypeClose?: (node: DoctypeCloseNode) => void;
    DoctypeAttribute?: (node: DoctypeAttributeNode) => void;
    DoctypeAttributeValue?: (node: DoctypeAttributeValueNode) => void;
    DoctypeAttributeWrapperStart?: (node: DoctypeAttributeWrapperStart) => void;
    DoctypeAttributeWrapperEnd?: (node: DoctypeAttributeWrapperEnd) => void;
  }

export interface RuleModule extends Omit<Rule.RuleModule, "create"> {
    create(context: Context): RuleListener
    meta?: Rule.RuleMetaData;
  }