/**
 * The transformation of the object
 */
export interface Transform {
  // Position
  linx: number;
  liny: number;
  linz: number;

  // Orientation (quaternion)
  rotx: number;
  roty: number;
  rotz: number;
  rotw: number;
}