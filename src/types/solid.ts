export type SolidType = "cube" | "cuboid" | "unknown";

export type SolidInfo = {
  type: SolidType;
  width: number;
  height: number;
  depth: number;
};