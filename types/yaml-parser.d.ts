declare module "markdownlint-cli2/parsers/yaml" {
  const parse: (text: string) => unknown;
  /**
   * Parse YAML text into an unvalidated value.
   */
  export default parse;
}
