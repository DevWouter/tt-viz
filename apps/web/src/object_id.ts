type PlayerKey = 'PlayerA' | 'PlayerB' | 'PlayerX' | 'PlayerZ';
type PlayerEntityType = 'Body' | 'Bat';
type PlayerEntityId = `${PlayerKey}_${PlayerEntityType}`;
type BallEntityId = 'Ball';
export type ObjectId = BallEntityId | PlayerEntityId;