import { PlayData } from "../../play";

const TABLE_HEIGHT = 0.76; // 0 is floor
const TABLE_WIDTH = 0.7625; // Right side, negative is left side, 0 is middle of table
const TABLE_DEPTH = 1.37; // One side, negative is other side, 0 is net


// X = Left/Right
// Y = Front/Back
// Z = Height

const TIME = {
  // Service by server
  STROKE_000_HIT: 0,
  STROKE_000_BOUNCE_OWNSIDE: 0.25,
  STROKE_000_CROSSNET: 0.5,
  STROKE_000_BOUNCE_OTHERSIDE: 0.75,

  // Return stroke by receiver
  STROKE_001_HIT: 1,
  STROKE_001_CROSSNET: 1.33,
  STROKE_001_BOUNCE: 1.66,

  // Stroke by server
  STROKE_002_HIT: 2,
  STROKE_002_CROSSNET: 2.33,
  STROKE_002_BOUNCE: 2.66,

  // Stroke by receiver
  STROKE_003_HIT: 3,
  STROKE_003_CROSSNET: 3.33,
  STROKE_003_BOUNCE: 3.66,
};

const VALUES = {
  RIGHT_TABLE: TABLE_WIDTH - 0.10,
  LEFT_TABLE: -(TABLE_WIDTH - 0.10),
  TABLE_BOUNCE_OWN_SIDE: TABLE_DEPTH * 0.66,
  TABLE_BOUNCE_OTHER_SIDE: -(TABLE_DEPTH * 0.66),
  NET: 0,
}

export const Play001FhRally: PlayData = {
  name: "001 FH Rally",
  description: "A simple rally between two right handed players",

  /**
   * These are the objects that need to be placed.
   */
  objects: ['Ball'],

  guide: {
    entries: [
      { time: TIME.STROKE_000_HIT, locale: 'nl-NL', title: "Service", description: "Serveer diagonaal vanuit de rechterhoek" },
      { time: TIME.STROKE_001_HIT, locale: 'nl-NL', title: "Ontvangst", description: "Ontvanger speelt diagonaal terug" },
      { time: TIME.STROKE_002_HIT, locale: 'nl-NL', title: "Slag 2", description: "De serveerder blijft diagonaal spelen" },
      { time: TIME.STROKE_003_HIT, locale: 'nl-NL', title: 'Slag 3', description: "De ontvanger blijft diagonaal terug spelen" },
    ]
  },

  // When we arrive at the end of the bounce, we repeat from return bounce
  endTime: TIME.STROKE_003_BOUNCE,
  afterEnd: { action: 'change-time', newTime: TIME.STROKE_001_BOUNCE },

  /**
   * The changes in the timeline. We only do the ball for now
   */
  timelineChannels: [
    {
      // LEFT/RIGHT
      objectID: "Ball", property: "linx", frames: [
        { time: TIME.STROKE_000_HIT, value: VALUES.RIGHT_TABLE },
        { time: TIME.STROKE_001_HIT, value: VALUES.LEFT_TABLE },
        { time: TIME.STROKE_002_HIT, value: VALUES.RIGHT_TABLE },
        { time: TIME.STROKE_003_HIT, value: VALUES.LEFT_TABLE },
      ]
    },
    {
      // FRONT/BACK
      objectID: "Ball", property: "liny", frames: [
        { time: TIME.STROKE_000_HIT, value: (TABLE_DEPTH * 1.2) },
        { time: TIME.STROKE_001_HIT, value: -(TABLE_DEPTH * 1.2) },
        { time: TIME.STROKE_002_HIT, value: (TABLE_DEPTH * 1.2) },
        { time: TIME.STROKE_003_HIT, value: -(TABLE_DEPTH * 1.2) },
      ]
    },
    {
      // Height
      objectID: "Ball", property: "linz", frames: [
        { time: TIME.STROKE_000_HIT, value: (TABLE_HEIGHT + 0.20) },
        { time: TIME.STROKE_000_BOUNCE_OWNSIDE, value: TABLE_HEIGHT },
        { time: TIME.STROKE_000_CROSSNET, value: (TABLE_HEIGHT + 0.15) },
        { time: TIME.STROKE_000_BOUNCE_OTHERSIDE, value: TABLE_HEIGHT },

        { time: TIME.STROKE_001_HIT, value: (TABLE_HEIGHT + 0.10) },
        { time: TIME.STROKE_001_CROSSNET, value: (TABLE_HEIGHT + 0.15) },
        { time: TIME.STROKE_001_BOUNCE, value: (TABLE_HEIGHT + 0.00) },

        { time: TIME.STROKE_001_HIT, value: (TABLE_HEIGHT + 0.10) },
        { time: TIME.STROKE_001_CROSSNET, value: (TABLE_HEIGHT + 0.15) },
        { time: TIME.STROKE_001_BOUNCE, value: (TABLE_HEIGHT + 0.00) },

        { time: TIME.STROKE_002_HIT, value: (TABLE_HEIGHT + 0.10) },
        { time: TIME.STROKE_002_CROSSNET, value: (TABLE_HEIGHT + 0.15) },
        { time: TIME.STROKE_002_BOUNCE, value: (TABLE_HEIGHT + 0.00) },

        { time: TIME.STROKE_003_HIT, value: (TABLE_HEIGHT + 0.10) },
        { time: TIME.STROKE_003_CROSSNET, value: (TABLE_HEIGHT + 0.15) },
        { time: TIME.STROKE_003_BOUNCE, value: (TABLE_HEIGHT + 0.00) },
      ]
    }
  ],
}