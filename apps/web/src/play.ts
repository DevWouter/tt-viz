import { ObjectId } from './object_id';
import { Transform } from './transform';

export class Play {
  constructor(
    private readonly data: PlayData,
  ) { }

  /**
   * Returns all the objects that need to be shown including the position/orientation
   * @param time The time
   */
  public getObjectTransforms(time: number): ObjectTransform[] {
    this.data.objects.forEach(objectId => {
      
    });
    throw new Error("Not implemented");
  }

  /**
   * Returns all the periods
   * 
   * @description useful for getting the "service" and "return", intended
   * to be used as navigation, but also for modifying the play.
   */
  public getPeriods(): PlayPeriod[] {
    throw new Error("Not implemented");
  }
}

export interface PlayPeriod {
  start: number;
  end: number;
  name: string;
  description: string;
}

export interface PlayLabel {
  time: number;
  name: string;
  description: string;
}

/**
 * Describes a certain.
 */
export interface ObjectTransform {
  objectId: ObjectId;
  transform: Transform;
}


/**
 * A play describes a single rally
 */
export interface PlayData {
  /**
   * The name with which we can identify the play. Is also the "save-name".
   */
  name: string;

  /**
   * Additional description
   */
  description: string;

  /**
   * Objects that will be available 
   */
  objects: ObjectId[];

  /**
   * Changes to the timeline
   */
  timelineChannels: TimelineChannel[];

  /**
   * An object that contains a list of instructions
   */
  guide: Guide;

  endTime: number;
  afterEnd: 'stop' | { action: 'change-time', newTime: number };
}

export interface Guide {
  entries: GuideEntry[];
}

export interface GuideEntry {
  time: number;
  locale: string;
  title: string;
  description: string;
}

/**
 * How we can determine the data.
 */
export type InterpolationType = "constant" | "linear";

interface TimelineChannel {
  objectID: ObjectId;
  property: keyof Transform;
  frames: {
    /** At what time */
    time: number;
    /** The new value */
    value: number;

    /**
     * What interpolation is used to get to the next position?
     * When `constant` it will not perform interpolation until the next keyframe applies
     * When `linear` it will apply a linear interpolation for each frame in between.
     * If missing we re-use the previous one of that object
     * If the first one is missing, we use linear. 
     */
    interpolation?: InterpolationType;
  }[]
}