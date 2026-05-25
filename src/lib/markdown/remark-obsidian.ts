import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

/**
 * Turns the directive nodes produced by remark-directive into elements the
 * react-markdown `components` map can target:
 *   :::callout{...}  -> <callout type=... title=...>
 *   :mark[...]       -> <mark>
 * Any other directive degrades to a plain span/div so it never crashes render.
 */
export const remarkObsidian: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const n = node as any;
      const data = n.data || (n.data = {});
      const attributes = n.attributes || {};

      if (n.name === "callout") {
        data.hName = "callout";
        data.hProperties = {
          type: attributes.type || "note",
          title: attributes.title || "",
        };
      } else if (n.name === "mark") {
        data.hName = "mark";
      } else {
        data.hName = node.type === "textDirective" ? "span" : "div";
      }
    });
  };
};
