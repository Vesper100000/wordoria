"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

type WordEntry = {
  word: string;
  part: string;
  definition: string;
  cn?: string;
  phonetic?: string;
  level?: WordLevel;
  example: string;
};

type WordLevel = "CET-4" | "CET-6" | "Contest" | "Visual" | "Advanced";

type Question = {
  prompt: string;
  options: string[];
  correct: string;
};

type WordRecord = {
  seen: number;
  correct: number;
  missed: number;
  last: string;
};

type SavedStudyState = {
  records?: Record<string, WordRecord>;
  saved?: string[];
  completedTracks?: string[];
  xp?: number;
};

type Photograph = {
  id: string;
  title: string;
  category: string;
  word: string;
  phonetic: string;
  part: string;
  definition: string;
  sentence: string;
  image: string;
  credit: string;
};

const photographCollections: Photograph[][] = [
[
  {
    id: "01",
    title: "Monument to Silence",
    category: "Architecture / Form",
    word: "austere",
    phonetic: "/aw-STEER/",
    part: "adjective",
    definition: "severely simple; without ornament or comfort",
    sentence: "The austere geometry of the structure amplifies its monumental presence.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Joshua Earle / Unsplash",
  },
  {
    id: "02",
    title: "Interlude in Concrete",
    category: "Light / Structure",
    word: "juxtapose",
    phonetic: "/JUK-stuh-pohz/",
    part: "verb",
    definition: "to place contrasting things together for effect",
    sentence: "The photographer juxtaposes rigid concrete with transient afternoon light.",
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Sebastian Unrau / Unsplash",
  },
  {
    id: "03",
    title: "Sculpted by Time",
    category: "Landscape / Texture",
    word: "ephemeral",
    phonetic: "/ih-FEM-er-uhl/",
    part: "adjective",
    definition: "lasting for a very short time",
    sentence: "Each ephemeral contour will be rewritten by the next desert wind.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Sean Oulashin / Unsplash",
  },
  {
    id: "04",
    title: "A Study in Shadow",
    category: "Abstract / Rhythm",
    word: "interplay",
    phonetic: "/IN-ter-play/",
    part: "noun",
    definition: "the way two or more things influence one another",
    sentence: "The interplay of shadow and surface turns architecture into abstraction.",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Samuel Ferrara / Unsplash",
  },
],
[
  {
    id: "05",
    title: "Chromatic Weather",
    category: "Color / Atmosphere",
    word: "iridescent",
    phonetic: "/ir-ih-DES-uhnt/",
    part: "adjective",
    definition: "showing shifting rainbow-like colors",
    sentence: "The iridescent sky turns weather into a field of moving color.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Unsplash",
  },
  {
    id: "06",
    title: "Quiet Canopy",
    category: "Forest / Calm",
    word: "serene",
    phonetic: "/suh-REEN/",
    part: "adjective",
    definition: "calm, peaceful, and untroubled",
    sentence: "The serene canopy gives the eye a place to rest.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Unsplash",
  },
  {
    id: "07",
    title: "Living Green",
    category: "Nature / Growth",
    word: "verdant",
    phonetic: "/VUR-dnt/",
    part: "adjective",
    definition: "green with healthy plants or grass",
    sentence: "The verdant slope makes growth feel almost audible.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Unsplash",
  },
  {
    id: "08",
    title: "One Figure, Wide Air",
    category: "Scale / Solitude",
    word: "solitary",
    phonetic: "/SOL-ih-ter-ee/",
    part: "adjective",
    definition: "alone; existing without others nearby",
    sentence: "A solitary figure can make a landscape feel larger.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Unsplash",
  },
],
[
  {
    id: "09",
    title: "Moving City",
    category: "Motion / Street",
    word: "kinetic",
    phonetic: "/kih-NET-ik/",
    part: "adjective",
    definition: "relating to movement or energy",
    sentence: "The kinetic blur makes the city feel awake.",
    image: "https://images.unsplash.com/photo-1641910343814-09987c4ee925?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Kevin Grieve / Unsplash",
  },
  {
    id: "10",
    title: "Night Lamp Bloom",
    category: "Light / Heat",
    word: "incandescent",
    phonetic: "/in-kuhn-DES-uhnt/",
    part: "adjective",
    definition: "glowing with light or intense feeling",
    sentence: "The incandescent window turns the street into a stage.",
    image: "https://images.unsplash.com/photo-1770112854553-4f496e5e911d?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Tsuyoshi Kozu / Unsplash",
  },
  {
    id: "11",
    title: "Before the Door",
    category: "Space / Boundary",
    word: "threshold",
    phonetic: "/THRESH-hohld/",
    part: "noun",
    definition: "the point at which something begins or changes",
    sentence: "A threshold is both an ending and an invitation.",
    image: "https://images.unsplash.com/photo-1763783196428-dc0f720d0eec?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Di Chen / Unsplash",
  },
  {
    id: "12",
    title: "Pattern Engine",
    category: "Detail / Pattern",
    word: "intricate",
    phonetic: "/IN-trih-kit/",
    part: "adjective",
    definition: "having many small, complex parts",
    sentence: "The intricate pattern rewards slow looking.",
    image: "https://images.unsplash.com/photo-1775259543157-b14870d469fb?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Haydn / Unsplash",
  },
],
[
  {
    id: "13",
    title: "Open Distance",
    category: "Landscape / Scale",
    word: "vast",
    phonetic: "/vast/",
    part: "adjective",
    definition: "extremely large in area, size, or amount",
    sentence: "The vast horizon makes the foreground feel fragile.",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Unsplash",
  },
  {
    id: "14",
    title: "Still Water Index",
    category: "Water / Stillness",
    word: "tranquil",
    phonetic: "/TRAN-kwil/",
    part: "adjective",
    definition: "peaceful and quiet",
    sentence: "The tranquil surface turns reflection into memory.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Unsplash",
  },
  {
    id: "15",
    title: "Figure Cut from Light",
    category: "Shadow / Outline",
    word: "silhouette",
    phonetic: "/sil-oo-ET/",
    part: "noun",
    definition: "a dark outline seen against a brighter background",
    sentence: "A silhouette can tell a story with almost no detail.",
    image: "https://images.unsplash.com/photo-1759756655356-c38229d186a6?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Malama Mushitu / Unsplash",
  },
  {
    id: "16",
    title: "Color at Full Volume",
    category: "Color / Intensity",
    word: "saturated",
    phonetic: "/SACH-uh-ray-tid/",
    part: "adjective",
    definition: "full of strong color or completely soaked",
    sentence: "The saturated palette makes the image feel immediate.",
    image: "https://images.unsplash.com/photo-1748885104507-f594bcbbfbb0?auto=format&fit=crop&fm=jpg&q=88&w=2400",
    credit: "Alexander X. / Unsplash",
  },
],
[
  {
    id: "17",
    title: "Measured Light",
    category: "Photography / Structure",
    word: "composition",
    phonetic: "/kom-puh-ZISH-un/",
    part: "noun",
    definition: "the arrangement of parts in an image or idea",
    sentence: "Composition turns separate details into one readable visual sentence.",
    image: "https://picsum.photos/seed/wordoria-17/2200/1500",
    credit: "Lorem Picsum",
  },
  {
    id: "18",
    title: "Bright Register",
    category: "Camera / Light",
    word: "exposure",
    phonetic: "/ik-SPOH-zher/",
    part: "noun",
    definition: "the amount of light allowed into a photograph",
    sentence: "Exposure decides whether the scene whispers or burns.",
    image: "https://picsum.photos/seed/wordoria-18/1600/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "19",
    title: "Opposite Edges",
    category: "Tone / Difference",
    word: "contrast",
    phonetic: "/KON-trast/",
    part: "noun",
    definition: "a clear difference between two things",
    sentence: "Contrast gives the image its pulse and argument.",
    image: "https://picsum.photos/id/1043/1800/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "20",
    title: "Long View",
    category: "Space / Depth",
    word: "perspective",
    phonetic: "/per-SPEK-tiv/",
    part: "noun",
    definition: "a way of seeing or representing depth",
    sentence: "Perspective changes the distance between the eye and the idea.",
    image: "https://picsum.photos/seed/wordoria-20/2300/1600",
    credit: "Lorem Picsum",
  },
],
[
  {
    id: "21",
    title: "Edge of Meaning",
    category: "Image / Boundary",
    word: "frame",
    phonetic: "/fraym/",
    part: "noun",
    definition: "the boundary that contains an image or idea",
    sentence: "A frame is a choice about what the viewer is allowed to see.",
    image: "https://picsum.photos/seed/wordoria-21/2200/1500",
    credit: "Lorem Picsum",
  },
  {
    id: "22",
    title: "Soft Opening",
    category: "Camera / Aperture",
    word: "aperture",
    phonetic: "/AP-er-cher/",
    part: "noun",
    definition: "an opening that controls how much light enters",
    sentence: "Aperture makes attention narrow or generous.",
    image: "https://picsum.photos/seed/wordoria-22/1600/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "23",
    title: "Instant Held",
    category: "Time / Capture",
    word: "shutter",
    phonetic: "/SHUT-er/",
    part: "noun",
    definition: "the camera part that opens briefly to admit light",
    sentence: "The shutter turns one second into evidence.",
    image: "https://picsum.photos/seed/wordoria-23/1800/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "24",
    title: "Small Scene",
    category: "Narrative / Edge",
    word: "vignette",
    phonetic: "/vin-YET/",
    part: "noun",
    definition: "a small scene or a darkened image edge",
    sentence: "A vignette makes the world feel discovered through a keyhole.",
    image: "https://picsum.photos/seed/wordoria-24/2300/1600",
    credit: "Lorem Picsum",
  },
],
[
  {
    id: "25",
    title: "Wide Account",
    category: "Landscape / Span",
    word: "panorama",
    phonetic: "/pan-uh-RAM-uh/",
    part: "noun",
    definition: "a wide view of a large scene",
    sentence: "A panorama invites the eye to travel instead of stop.",
    image: "https://picsum.photos/seed/wordoria-25/2200/1500",
    credit: "Lorem Picsum",
  },
  {
    id: "26",
    title: "Face Study",
    category: "Figure / Portrait",
    word: "portraiture",
    phonetic: "/POR-truh-cher/",
    part: "noun",
    definition: "the art of making portraits",
    sentence: "Portraiture asks the face to become a landscape of attention.",
    image: "https://picsum.photos/seed/wordoria-26/1600/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "27",
    title: "Real Weather",
    category: "Truth / Record",
    word: "documentary",
    phonetic: "/dok-yuh-MEN-tuh-ree/",
    part: "adjective",
    definition: "recording real events or conditions",
    sentence: "A documentary image carries the pressure of actual life.",
    image: "https://picsum.photos/seed/wordoria-27/1800/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "28",
    title: "Cut Sequence",
    category: "Edit / Assembly",
    word: "montage",
    phonetic: "/mon-TAHZH/",
    part: "noun",
    definition: "a sequence made by combining separate images",
    sentence: "Montage lets separate fragments argue with one another.",
    image: "https://picsum.photos/seed/wordoria-28/2300/1600",
    credit: "Lorem Picsum",
  },
],
[
  {
    id: "29",
    title: "Near Surface",
    category: "Space / Front",
    word: "foreground",
    phonetic: "/FOR-ground/",
    part: "noun",
    definition: "the part of a scene nearest to the viewer",
    sentence: "The foreground is where the viewer first enters the scene.",
    image: "https://picsum.photos/id/1015/2200/1500",
    credit: "Lorem Picsum",
  },
  {
    id: "30",
    title: "Distant Layer",
    category: "Space / Back",
    word: "background",
    phonetic: "/BAK-ground/",
    part: "noun",
    definition: "the part of a scene behind the main subject",
    sentence: "Background can quietly change the meaning of the subject.",
    image: "https://picsum.photos/seed/wordoria-30/1600/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "31",
    title: "Balanced Mirror",
    category: "Order / Form",
    word: "symmetry",
    phonetic: "/SIM-uh-tree/",
    part: "noun",
    definition: "balanced similarity on both sides",
    sentence: "Symmetry gives the eye a feeling of ritual order.",
    image: "https://picsum.photos/seed/wordoria-31/1800/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "32",
    title: "Uneven Grace",
    category: "Balance / Irregular",
    word: "asymmetry",
    phonetic: "/ay-SIM-uh-tree/",
    part: "noun",
    definition: "balance created without matching sides",
    sentence: "Asymmetry keeps the image alert and breathing.",
    image: "https://picsum.photos/seed/wordoria-32/2300/1600",
    credit: "Lorem Picsum",
  },
],
[
  {
    id: "33",
    title: "One Color Memory",
    category: "Color / Reduction",
    word: "monochrome",
    phonetic: "/MON-uh-krohm/",
    part: "adjective",
    definition: "using one color or shades of one color",
    sentence: "Monochrome removes noise so texture can speak louder.",
    image: "https://picsum.photos/id/1056/2200/1500",
    credit: "Lorem Picsum",
  },
  {
    id: "34",
    title: "Dark Against Bright",
    category: "Light / Drama",
    word: "chiaroscuro",
    phonetic: "/kee-ahr-uh-SKYOOR-oh/",
    part: "noun",
    definition: "strong contrast between light and dark",
    sentence: "Chiaroscuro gives the image a theatrical pulse.",
    image: "https://picsum.photos/seed/wordoria-34/1600/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "35",
    title: "Chosen Colors",
    category: "Color / System",
    word: "palette",
    phonetic: "/PAL-it/",
    part: "noun",
    definition: "a set of colors used together",
    sentence: "A palette can make a photograph feel warm, distant, or severe.",
    image: "https://picsum.photos/seed/wordoria-35/1800/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "36",
    title: "Full Range",
    category: "Color / Range",
    word: "spectrum",
    phonetic: "/SPEK-trum/",
    part: "noun",
    definition: "a full range of colors, ideas, or qualities",
    sentence: "Spectrum reminds the learner that meaning has many shades.",
    image: "https://picsum.photos/seed/wordoria-36/2300/1600",
    credit: "Lorem Picsum",
  },
],
[
  {
    id: "37",
    title: "Clear Attention",
    category: "Lens / Priority",
    word: "focus",
    phonetic: "/FOH-kus/",
    part: "noun",
    definition: "the point of clearest attention or sharpness",
    sentence: "Focus tells the viewer where thought begins.",
    image: "https://picsum.photos/seed/wordoria-37/2200/1500",
    credit: "Lorem Picsum",
  },
  {
    id: "38",
    title: "Soft Uncertainty",
    category: "Image / Softness",
    word: "blur",
    phonetic: "/blur/",
    part: "noun",
    definition: "a soft or unclear visual effect",
    sentence: "Blur can turn speed into feeling.",
    image: "https://picsum.photos/seed/wordoria-38/1600/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "39",
    title: "Visible Texture",
    category: "Surface / Detail",
    word: "grain",
    phonetic: "/grayn/",
    part: "noun",
    definition: "small visible particles or texture in an image",
    sentence: "Grain makes the image feel touched by time.",
    image: "https://picsum.photos/seed/wordoria-39/1800/2200",
    credit: "Lorem Picsum",
  },
  {
    id: "40",
    title: "Sharp Archive",
    category: "Detail / Clarity",
    word: "resolution",
    phonetic: "/rez-uh-LOO-shun/",
    part: "noun",
    definition: "the sharpness or level of detail in an image",
    sentence: "Resolution decides how much detail memory can keep.",
    image: "https://picsum.photos/seed/wordoria-40/2300/1600",
    credit: "Lorem Picsum",
  },
],
];

const photographs = photographCollections.flat();

const baseWordBank: WordEntry[] = [
  { word: "austere", part: "adjective", definition: "severely simple; without ornament or comfort", example: "The room felt austere, but every line had purpose." },
  { word: "ornate", part: "adjective", definition: "covered with complex decoration", example: "The ornate ceiling distracted from the quiet doorway." },
  { word: "capricious", part: "adjective", definition: "changing suddenly and unpredictably", example: "The capricious weather kept rewriting the scene." },
  { word: "ephemeral", part: "adjective", definition: "lasting for a very short time", example: "The reflection was ephemeral, gone before sunset." },
  { word: "permanent", part: "adjective", definition: "lasting or intended to last forever", example: "The plaque gave the memory a permanent form." },
  { word: "rigid", part: "adjective", definition: "stiff, fixed, and difficult to bend or change", example: "The rigid frame made the soft light feel sharper." },
  { word: "interplay", part: "noun", definition: "the way two or more things influence one another", example: "The interplay of scale and shadow carried the image." },
  { word: "absence", part: "noun", definition: "the state of something being missing or not present", example: "The absence of color made the texture louder." },
  { word: "silence", part: "noun", definition: "the absence of sound", example: "The photograph held a kind of architectural silence." },
  { word: "juxtapose", part: "verb", definition: "to place contrasting things together for effect", example: "The artist chose to juxtapose glass with stone." },
  { word: "transient", part: "adjective", definition: "temporary; passing quickly", example: "The transient glow changed the mood of the wall." },
  { word: "texture", part: "noun", definition: "the feel, appearance, or character of a surface", example: "The texture of the concrete made the image tactile." },
  { word: "observe", part: "verb", definition: "to watch carefully in order to learn or understand", example: "To observe well is to slow the eye down." },
  { word: "interpret", part: "verb", definition: "to explain the meaning of something", example: "She learned to interpret the image through its shadows." },
  { word: "refine", part: "verb", definition: "to improve something by making small, careful changes", example: "Each revision helped refine the sentence." },
  { word: "luminous", part: "adjective", definition: "giving off or reflecting light", example: "The luminous edge separated the building from the sky." },
  { word: "monumental", part: "adjective", definition: "very large, impressive, or historically important", example: "The stairs felt monumental from below." },
  { word: "restraint", part: "noun", definition: "controlled simplicity; the avoidance of excess", example: "The poster used restraint instead of decoration." },
  { word: "contour", part: "noun", definition: "the outline or shape of a form", example: "The dune's contour softened as the light fell." },
  { word: "abstract", part: "adjective", definition: "not representing things in a literal or realistic way", example: "The cropped facade became abstract." },
  { word: "ambiguous", part: "adjective", definition: "having more than one possible meaning", example: "The ambiguous reflection made the window hard to read." },
  { word: "cohesive", part: "adjective", definition: "unified and working well as a whole", example: "The sequence felt cohesive because the tones repeated." },
  { word: "meticulous", part: "adjective", definition: "showing great attention to detail", example: "Her meticulous notes turned images into memory cues." },
  { word: "nuance", part: "noun", definition: "a subtle difference in meaning, feeling, or appearance", example: "A small nuance of color changed the mood." },
  { word: "resonant", part: "adjective", definition: "deeply meaningful or emotionally powerful", example: "The empty doorway felt strangely resonant." },
  { word: "immersive", part: "adjective", definition: "surrounding the viewer so fully that attention is absorbed", example: "The immersive room made vocabulary feel physical." },
  { word: "tactile", part: "adjective", definition: "connected with touch or the feeling of a surface", example: "The tactile grain of the wall held the eye." },
  { word: "lucid", part: "adjective", definition: "clear and easy to understand", example: "A lucid definition made the word easy to keep." },
  { word: "subtle", part: "adjective", definition: "delicate, not obvious, and requiring careful attention", example: "The subtle shadow made the composition work." },
  { word: "evoke", part: "verb", definition: "to bring a feeling, memory, or image into the mind", example: "The photograph can evoke a place you have never visited." },
  { word: "iridescent", part: "adjective", definition: "showing shifting rainbow-like colors", example: "The iridescent surface changed as the viewer moved." },
  { word: "serene", part: "adjective", definition: "calm, peaceful, and untroubled", example: "The serene lake made the whole scene breathe." },
  { word: "verdant", part: "adjective", definition: "green with healthy plants or grass", example: "The verdant valley suggested renewal." },
  { word: "solitary", part: "adjective", definition: "alone; existing without others nearby", example: "A solitary tree anchored the empty field." },
  { word: "kinetic", part: "adjective", definition: "full of movement or energy", example: "The kinetic street scene felt almost musical." },
  { word: "incandescent", part: "adjective", definition: "glowing with light or intense feeling", example: "The incandescent window warmed the dark street." },
  { word: "threshold", part: "noun", definition: "the point at which something begins or changes", example: "The doorway became a threshold between two moods." },
  { word: "intricate", part: "adjective", definition: "having many small, complex parts", example: "The intricate pattern rewarded careful looking." },
  { word: "vast", part: "adjective", definition: "extremely large in area, size, or amount", example: "The vast sky made the road feel delicate." },
  { word: "tranquil", part: "adjective", definition: "peaceful and quiet", example: "The tranquil water held the mountain in place." },
  { word: "silhouette", part: "noun", definition: "a dark outline seen against a brighter background", example: "The silhouette told the story without detail." },
  { word: "saturated", part: "adjective", definition: "full of strong color or completely soaked", example: "The saturated orange made the poster impossible to ignore." },
  { word: "deliberate", part: "adjective", definition: "done carefully and intentionally", example: "Every crop felt deliberate, not accidental." },
  { word: "fragile", part: "adjective", definition: "easily broken or damaged", example: "The fragile reflection disappeared with one ripple." },
  { word: "coherent", part: "adjective", definition: "clear, logical, and consistent", example: "The sequence became coherent after the repeated blue tones." },
  { word: "vivid", part: "adjective", definition: "bright, intense, and full of life", example: "The vivid memory returned when she saw the color." },
  { word: "adjacent", part: "adjective", definition: "next to or near something else", example: "Adjacent windows created a rhythm across the wall." },
  { word: "dormant", part: "adjective", definition: "inactive but able to become active later", example: "The dormant garden waited under winter light." },
  { word: "articulate", part: "verb", definition: "to express an idea clearly in words", example: "She learned to articulate what the image made her feel." },
  { word: "discern", part: "verb", definition: "to notice or understand something with effort", example: "In the fog, he could barely discern the bridge." },
  { word: "accumulate", part: "verb", definition: "to gather or build up over time", example: "Small details accumulate into meaning." },
  { word: "resilient", part: "adjective", definition: "able to recover after difficulty", example: "The resilient plant returned after the storm." },
  { word: "elusive", part: "adjective", definition: "difficult to find, catch, or define", example: "The elusive expression made the portrait memorable." },
  { word: "candid", part: "adjective", definition: "honest, natural, and not posed", example: "The candid gesture felt more truthful than a formal pose." },
  { word: "composed", part: "adjective", definition: "calm, controlled, or carefully arranged", example: "The composed frame balanced chaos and stillness." },
  { word: "peripheral", part: "adjective", definition: "at the edge rather than the center", example: "A peripheral shadow changed the whole composition." },
  { word: "diffuse", part: "adjective", definition: "spread out and soft rather than direct", example: "Diffuse light softened the architecture." },
  { word: "radiant", part: "adjective", definition: "shining brightly or showing joy", example: "The radiant edge of the cloud held the eye." },
  { word: "stark", part: "adjective", definition: "plain, severe, and sharply clear", example: "The stark wall made every mark visible." },
  { word: "granular", part: "adjective", definition: "made of small grains or fine details", example: "The granular texture made the image tactile." },
  { word: "poised", part: "adjective", definition: "calm, balanced, and ready", example: "The dancer looked poised between motion and rest." },
  { word: "layered", part: "adjective", definition: "having several levels, meanings, or surfaces", example: "The layered reflections turned one street into many." },
  { word: "dynamic", part: "adjective", definition: "active, energetic, and changing", example: "The dynamic diagonal gave the scene momentum." },
  { word: "meditative", part: "adjective", definition: "quiet and thoughtful", example: "The meditative image asked the viewer to slow down." },
  { word: "glacial", part: "adjective", definition: "icy, very cold, or extremely slow", example: "The glacial blue made the room feel silent." },
  { word: "arid", part: "adjective", definition: "very dry or lacking moisture", example: "The arid plain reduced the image to line and heat." },
  { word: "opulent", part: "adjective", definition: "rich, luxurious, and lavish", example: "The opulent interior glittered with detail." },
  { word: "transparent", part: "adjective", definition: "allowing light to pass through clearly", example: "The transparent curtain turned sunlight into texture." },
  { word: "opaque", part: "adjective", definition: "not allowing light through; hard to understand", example: "The opaque glass hid the room behind it." },
  { word: "fragmented", part: "adjective", definition: "broken into separate pieces", example: "The fragmented mirror made one face become many." },
  { word: "harmonious", part: "adjective", definition: "pleasantly balanced or working well together", example: "The harmonious palette made the page feel calm." },
  { word: "dissonant", part: "adjective", definition: "not agreeing or sounding tense together", example: "The dissonant colors made the image uneasy." },
  { word: "precise", part: "adjective", definition: "exact and carefully defined", example: "A precise crop made the subject stronger." },
  { word: "expansive", part: "adjective", definition: "wide, open, and large in scope", example: "The expansive sky gave the scene room to breathe." },
  { word: "compressed", part: "adjective", definition: "pressed into a smaller or denser form", example: "The compressed perspective made the street feel crowded." },
  { word: "elaborate", part: "adjective", definition: "detailed and carefully developed", example: "The elaborate facade was full of small surprises." },
  { word: "minimal", part: "adjective", definition: "using very few elements", example: "The minimal poster relied on one strong line." },
  { word: "weathered", part: "adjective", definition: "changed or worn by age and weather", example: "The weathered door carried years of touch." },
  { word: "pristine", part: "adjective", definition: "perfectly clean, fresh, or unspoiled", example: "The pristine snow erased every distraction." },
  { word: "oblique", part: "adjective", definition: "slanting or indirect", example: "An oblique angle made the corridor feel longer." },
  { word: "parallel", part: "adjective", definition: "running beside another line at the same distance", example: "Parallel shadows divided the floor." },
  { word: "vertical", part: "adjective", definition: "standing or moving straight up and down", example: "Vertical lines made the building feel taller." },
  { word: "horizontal", part: "adjective", definition: "flat or level from side to side", example: "A horizontal horizon calmed the composition." },
  { word: "sequential", part: "adjective", definition: "following in a particular order", example: "Sequential panels turned observation into a story." },
  { word: "recursive", part: "adjective", definition: "repeating or referring back to itself", example: "The recursive pattern seemed to fold inward forever." },
  { word: "intuitive", part: "adjective", definition: "understood by feeling rather than formal reasoning", example: "The intuitive layout guided the eye naturally." },
  { word: "analytical", part: "adjective", definition: "using careful reasoning and examination", example: "An analytical viewer notices structure before mood." },
  { word: "contextual", part: "adjective", definition: "related to the surrounding situation or background", example: "A contextual clue changed the meaning of the sign." },
  { word: "symbolic", part: "adjective", definition: "representing a larger idea or meaning", example: "The empty chair became symbolic of absence." },
  { word: "literal", part: "adjective", definition: "using the most basic or exact meaning", example: "A literal reading missed the emotional tone." },
  { word: "figurative", part: "adjective", definition: "using imaginative or non-literal meaning", example: "The broken window became a figurative wound." },
  { word: "contemplative", part: "adjective", definition: "deeply thoughtful and reflective", example: "The contemplative portrait felt quiet but intense." },
  { word: "volatile", part: "adjective", definition: "likely to change suddenly or intensely", example: "Volatile light made the scene feel unstable." },
  { word: "stable", part: "adjective", definition: "steady and not likely to change", example: "A stable triangle held the composition together." },
  { word: "adaptive", part: "adjective", definition: "able to change for new conditions", example: "Adaptive learners turn mistakes into cues." },
  { word: "archival", part: "adjective", definition: "related to records kept for long-term memory", example: "The archival image preserved an ordinary afternoon." },
  { word: "emergent", part: "adjective", definition: "beginning to appear or become known", example: "An emergent pattern appeared after several examples." },
  { word: "dimensional", part: "adjective", definition: "having a sense of depth or measurable space", example: "The dimensional shadow made the flat wall feel sculptural." },
  { word: "focal", part: "adjective", definition: "central or most important in attention", example: "The red door became the focal point." },
  { word: "atmospheric", part: "adjective", definition: "creating a strong mood or feeling of place", example: "The atmospheric fog made the street feel cinematic." },
];

const expandedWordData = [
  ["composition", "noun", "the arrangement of parts in an image or idea", "the arrangement of parts in an image or idea"],
  ["exposure", "noun", "the amount of light allowed into a photograph", "the amount of light allowed into a photograph"],
  ["contrast", "noun", "a clear difference between two things", "a clear difference between two things"],
  ["perspective", "noun", "a way of seeing or representing depth", "a way of seeing or representing depth"],
  ["frame", "noun", "the boundary that contains an image or idea", "the boundary that contains an image or idea"],
  ["aperture", "noun", "an opening that controls how much light enters", "an opening that controls how much light enters"],
  ["shutter", "noun", "the camera part that opens briefly to admit light", "the camera part that opens briefly to admit light"],
  ["vignette", "noun", "a small scene or a darkened image edge", "a small scene or a darkened image edge"],
  ["panorama", "noun", "a wide view of a large scene", "a wide view of a large scene"],
  ["portraiture", "noun", "the art of making portraits", "the art of making portraits"],
  ["documentary", "adjective", "recording real events or conditions", "recording real events or conditions"],
  ["montage", "noun", "a sequence made by combining separate images", "a sequence made by combining separate images"],
  ["foreground", "noun", "the part of a scene nearest to the viewer", "the part of a scene nearest to the viewer"],
  ["background", "noun", "the part of a scene behind the main subject", "the part of a scene behind the main subject"],
  ["symmetry", "noun", "balanced similarity on both sides", "balanced similarity on both sides"],
  ["asymmetry", "noun", "balance created without matching sides", "balance created without matching sides"],
  ["monochrome", "adjective", "using one color or shades of one color", "using one color or shades of one color"],
  ["chiaroscuro", "noun", "strong contrast between light and dark", "strong contrast between light and dark"],
  ["palette", "noun", "a set of colors used together", "a set of colors used together"],
  ["spectrum", "noun", "a full range of colors, ideas, or qualities", "a full range of colors, ideas, or qualities"],
  ["focus", "noun", "the point of clearest attention or sharpness", "the point of clearest attention or sharpness"],
  ["blur", "noun", "a soft or unclear visual effect", "a soft or unclear visual effect"],
  ["grain", "noun", "small visible particles or texture in an image", "small visible particles or texture in an image"],
  ["resolution", "noun", "the sharpness or level of detail in an image", "the sharpness or level of detail in an image"],
  ["crop", "verb", "to cut an image to a chosen boundary", "to cut an image to a chosen boundary"],
  ["angle", "noun", "the direction from which something is seen", "the direction from which something is seen"],
  ["lens", "noun", "a curved piece of glass that focuses light", "a curved piece of glass that focuses light"],
  ["highlight", "noun", "the brightest or most important part", "the brightest or most important part"],
  ["shadowplay", "noun", "the expressive use of moving or layered shadows", "the expressive use of moving or layered shadows"],
  ["reflection", "noun", "an image returned by a surface or a careful thought", "an image returned by a surface or a careful thought"],
  ["refraction", "noun", "the bending of light as it passes through something", "the bending of light as it passes through something"],
  ["horizon", "noun", "the line where earth or sea seems to meet the sky", "the line where earth or sea seems to meet the sky"],
  ["depth", "noun", "distance from front to back or complexity of meaning", "distance from front to back or complexity of meaning"],
  ["scale", "noun", "relative size or proportion", "relative size or proportion"],
  ["proportion", "noun", "the size relationship between parts", "the size relationship between parts"],
  ["alignment", "noun", "the arrangement of parts along a line or purpose", "the arrangement of parts along a line or purpose"],
  ["balance", "noun", "a stable relationship between different parts", "a stable relationship between different parts"],
  ["emphasis", "noun", "special importance or visual stress", "special importance or visual stress"],
  ["clarity", "noun", "clearness of image, thought, or expression", "clearness of image, thought, or expression"],
  ["distortion", "noun", "a change that twists normal shape or meaning", "a change that twists normal shape or meaning"],
  ["backlight", "noun", "light coming from behind the subject", "light coming from behind the subject"],
  ["halftone", "noun", "a print effect made from dots of different sizes", "a print effect made from dots of different sizes"],
  ["saturation", "noun", "the strength or purity of a color", "the strength or purity of a color"],
  ["hue", "noun", "a particular color or shade", "a particular color or shade"],
  ["tint", "noun", "a slight or pale color variation", "a slight or pale color variation"],
  ["shade", "noun", "darkness caused by blocked light", "darkness caused by blocked light"],
  ["gradient", "noun", "a gradual change from one color or value to another", "a gradual change from one color or value to another"],
  ["glimmer", "noun", "a faint or wavering light", "a faint or wavering light"],
  ["gleam", "noun", "a brief or soft shine", "a brief or soft shine"],
  ["glare", "noun", "strong, uncomfortable brightness", "strong, uncomfortable brightness"],
  ["infer", "verb", "to reach an idea from evidence rather than direct statement", "to reach an idea from evidence rather than direct statement"],
  ["imply", "verb", "to suggest something without saying it directly", "to suggest something without saying it directly"],
  ["clarify", "verb", "to make something clearer or easier to understand", "to make something clearer or easier to understand"],
  ["evaluate", "verb", "to judge the value or quality of something", "to judge the value or quality of something"],
  ["critique", "noun", "a careful judgment or analysis", "a careful judgment or analysis"],
  ["premise", "noun", "an idea on which an argument is based", "an idea on which an argument is based"],
  ["evidence", "noun", "facts or details that support an idea", "facts or details that support an idea"],
  ["argument", "noun", "a reasoned case for a point of view", "a reasoned case for a point of view"],
  ["conclusion", "noun", "a final idea reached after reasoning", "a final idea reached after reasoning"],
  ["stance", "noun", "a position or attitude toward an issue", "a position or attitude toward an issue"],
  ["assumption", "noun", "something accepted as true without proof", "something accepted as true without proof"],
  ["contradiction", "noun", "a conflict between two ideas or statements", "a conflict between two ideas or statements"],
  ["implication", "noun", "a possible meaning or result that is suggested", "a possible meaning or result that is suggested"],
  ["inference", "noun", "a conclusion reached from evidence", "a conclusion reached from evidence"],
  ["synthesis", "noun", "the combining of ideas into a larger whole", "the combining of ideas into a larger whole"],
  ["analysis", "noun", "careful study of parts to understand a whole", "careful study of parts to understand a whole"],
  ["hypothesis", "noun", "a testable idea or possible explanation", "a testable idea or possible explanation"],
  ["rationale", "noun", "the reason behind a choice or action", "the reason behind a choice or action"],
  ["criterion", "noun", "a standard used for judgment", "a standard used for judgment"],
  ["framework", "noun", "a structure for organizing ideas", "a structure for organizing ideas"],
  ["concept", "noun", "a general idea or mental category", "a general idea or mental category"],
  ["category", "noun", "a group defined by shared features", "a group defined by shared features"],
  ["distinction", "noun", "a difference between similar things", "a difference between similar things"],
  ["relevance", "noun", "the degree to which something matters to a topic", "the degree to which something matters to a topic"],
  ["validity", "noun", "the soundness or truth of an idea or argument", "the soundness or truth of an idea or argument"],
  ["bias", "noun", "a tendency that affects fair judgment", "a tendency that affects fair judgment"],
  ["objective", "adjective", "based on facts rather than personal feeling", "based on facts rather than personal feeling"],
  ["subjective", "adjective", "based on personal feeling or viewpoint", "based on personal feeling or viewpoint"],
  ["annotate", "verb", "to add notes that explain or comment on a text", "to add notes that explain or comment on a text"],
  ["summarize", "verb", "to state the main ideas briefly", "to state the main ideas briefly"],
  ["paraphrase", "verb", "to express the same idea in different words", "to express the same idea in different words"],
  ["compare", "verb", "to examine similarities and differences", "to examine similarities and differences"],
  ["differentiate", "verb", "to show how things are different", "to show how things are different"],
  ["classify", "verb", "to arrange into groups", "to arrange into groups"],
  ["define", "verb", "to state the meaning clearly", "to state the meaning clearly"],
  ["illustrate", "verb", "to explain using an example or image", "to explain using an example or image"],
  ["justify", "verb", "to give reasons for something", "to give reasons for something"],
  ["examine", "verb", "to look at carefully", "to look at carefully"],
  ["investigate", "verb", "to study in order to discover facts", "to study in order to discover facts"],
  ["trace", "verb", "to follow the development or path of something", "to follow the development or path of something"],
  ["formulate", "verb", "to create or express carefully", "to create or express carefully"],
  ["revise", "verb", "to improve by changing details", "to improve by changing details"],
  ["integrate", "verb", "to combine parts into a whole", "to combine parts into a whole"],
  ["synthesize", "verb", "to combine ideas to form something new", "to combine ideas to form something new"],
  ["specify", "verb", "to state something exactly", "to state something exactly"],
  ["generalize", "verb", "to form a broad idea from examples", "to form a broad idea from examples"],
  ["question", "verb", "to doubt or examine critically", "to doubt or examine critically"],
  ["respond", "verb", "to answer or react", "to answer or react"],
  ["deduce", "verb", "to reach a conclusion by reasoning", "to reach a conclusion by reasoning"],
  ["verify", "verb", "to check that something is true or accurate", "to check that something is true or accurate"],
  ["melancholy", "adjective", "quietly sad or thoughtful", "quietly sad or thoughtful"],
  ["wistful", "adjective", "sadly longing for something", "sadly longing for something"],
  ["jubilant", "adjective", "showing great joy", "showing great joy"],
  ["solemn", "adjective", "serious and formal in mood", "serious and formal in mood"],
  ["tender", "adjective", "gentle, soft, and caring", "gentle, soft, and caring"],
  ["intimate", "adjective", "private, close, and personal", "private, close, and personal"],
  ["restless", "adjective", "unable to stay still or calm", "unable to stay still or calm"],
  ["uneasy", "adjective", "slightly worried or uncomfortable", "slightly worried or uncomfortable"],
  ["pensive", "adjective", "deeply and quietly thoughtful", "deeply and quietly thoughtful"],
  ["nostalgic", "adjective", "longing for the past", "longing for the past"],
  ["exhilarated", "adjective", "very excited and full of energy", "very excited and full of energy"],
  ["somber", "adjective", "dark, serious, or sad", "dark, serious, or sad"],
  ["buoyant", "adjective", "cheerful and able to recover quickly", "cheerful and able to recover quickly"],
  ["rapturous", "adjective", "filled with intense joy or delight", "filled with intense joy or delight"],
  ["brooding", "adjective", "darkly thoughtful or threatening", "darkly thoughtful or threatening"],
  ["earnest", "adjective", "serious and sincere", "serious and sincere"],
  ["vulnerable", "adjective", "open to harm or emotional exposure", "open to harm or emotional exposure"],
  ["stoic", "adjective", "calm and enduring pain without complaint", "calm and enduring pain without complaint"],
  ["fervent", "adjective", "showing strong and sincere feeling", "showing strong and sincere feeling"],
  ["whimsical", "adjective", "playful, unusual, and imaginative", "playful, unusual, and imaginative"],
  ["ominous", "adjective", "suggesting that something bad may happen", "suggesting that something bad may happen"],
  ["reverent", "adjective", "showing deep respect", "showing deep respect"],
  ["hushed", "adjective", "quiet and still", "quiet and still"],
  ["mournful", "adjective", "full of sadness or grief", "full of sadness or grief"],
  ["playful", "adjective", "light, fun, and not too serious", "light, fun, and not too serious"],
  ["anxious", "adjective", "worried or nervous", "worried or nervous"],
  ["assured", "adjective", "confident and certain", "confident and certain"],
  ["detached", "adjective", "emotionally separate or distant", "emotionally separate or distant"],
  ["immersed", "adjective", "deeply involved or absorbed", "deeply involved or absorbed"],
  ["startled", "adjective", "suddenly surprised", "suddenly surprised"],
  ["reflective", "adjective", "thoughtful or able to reflect light", "thoughtful or able to reflect light"],
  ["tense", "adjective", "stretched tight or emotionally strained", "stretched tight or emotionally strained"],
  ["gentle", "adjective", "soft, mild, and kind", "soft, mild, and kind"],
  ["severe", "adjective", "very strict, serious, or harsh", "very strict, serious, or harsh"],
  ["graceful", "adjective", "moving or shaped with smooth beauty", "moving or shaped with smooth beauty"],
  ["raw", "adjective", "unprocessed, exposed, or emotionally direct", "unprocessed, exposed, or emotionally direct"],
  ["sincere", "adjective", "honest and genuine", "honest and genuine"],
  ["restrained", "adjective", "controlled and not excessive", "controlled and not excessive"],
  ["electric", "adjective", "exciting and full of energy", "exciting and full of energy"],
  ["dreamy", "adjective", "soft, unreal, or like a dream", "soft, unreal, or like a dream"],
  ["uncanny", "adjective", "strange in a slightly unsettling way", "strange in a slightly unsettling way"],
  ["remote", "adjective", "far away physically or emotionally", "far away physically or emotionally"],
  ["bleak", "adjective", "cold, empty, and without comfort", "cold, empty, and without comfort"],
  ["delicate", "adjective", "fine, fragile, or carefully subtle", "fine, fragile, or carefully subtle"],
  ["vibrant", "adjective", "full of color, energy, or life", "full of color, energy, or life"],
  ["muted", "adjective", "softened in color, sound, or feeling", "softened in color, sound, or feeling"],
  ["peaceful", "adjective", "calm and without disturbance", "calm and without disturbance"],
  ["haunting", "adjective", "hard to forget because it is beautiful or sad", "hard to forget because it is beautiful or sad"],
  ["euphoric", "adjective", "extremely happy and excited", "extremely happy and excited"],
  ["axis", "noun", "an imaginary line around which form is organized", "an imaginary line around which form is organized"],
  ["grid", "noun", "a system of crossing lines used for structure", "a system of crossing lines used for structure"],
  ["module", "noun", "a repeated unit within a larger system", "a repeated unit within a larger system"],
  ["sequence", "noun", "a set of things arranged in order", "a set of things arranged in order"],
  ["interval", "noun", "a space or time between two points", "a space or time between two points"],
  ["boundary", "noun", "a line or limit between areas or ideas", "a line or limit between areas or ideas"],
  ["margin", "noun", "an empty edge around content", "an empty edge around content"],
  ["center", "noun", "the middle or main point", "the middle or main point"],
  ["edge", "noun", "the outer limit of a surface or idea", "the outer limit of a surface or idea"],
  ["surface", "noun", "the outside layer or visible face", "the outside layer or visible face"],
  ["volume", "noun", "the amount of space something occupies", "the amount of space something occupies"],
  ["mass", "noun", "a large body or solid amount", "a large body or solid amount"],
  ["void", "noun", "an empty space or absence", "an empty space or absence"],
  ["density", "noun", "the amount packed into a space", "the amount packed into a space"],
  ["pattern", "noun", "a repeated arrangement or design", "a repeated arrangement or design"],
  ["fabric", "noun", "woven material or the basic structure of something", "woven material or the basic structure of something"],
  ["structure", "noun", "the way parts are arranged into a whole", "the way parts are arranged into a whole"],
  ["scaffold", "noun", "a temporary or supporting framework", "a temporary or supporting framework"],
  ["corridor", "noun", "a long passage through a building or space", "a long passage through a building or space"],
  ["facade", "noun", "the front of a building or an outward appearance", "the front of a building or an outward appearance"],
  ["interior", "noun", "the inside part of a place", "the inside part of a place"],
  ["exterior", "noun", "the outside part or surface", "the outside part or surface"],
  ["outline", "noun", "the outer shape or basic plan", "the outer shape or basic plan"],
  ["curve", "noun", "a smoothly bending line", "a smoothly bending line"],
  ["plane", "noun", "a flat surface or level", "a flat surface or level"],
  ["layer", "noun", "one level or sheet over another", "one level or sheet over another"],
  ["segment", "noun", "one part cut from a whole", "one part cut from a whole"],
  ["cluster", "noun", "a group of things close together", "a group of things close together"],
  ["network", "noun", "a connected system of points or people", "a connected system of points or people"],
  ["junction", "noun", "a place where lines or paths meet", "a place where lines or paths meet"],
  ["passage", "noun", "a route, corridor, or section of text", "a route, corridor, or section of text"],
  ["opening", "noun", "a hole, beginning, or opportunity", "a hole, beginning, or opportunity"],
  ["enclosure", "noun", "a closed or partly closed space", "a closed or partly closed space"],
  ["expansion", "noun", "the act of becoming larger or wider", "the act of becoming larger or wider"],
  ["contraction", "noun", "the act of becoming smaller or tighter", "the act of becoming smaller or tighter"],
  ["rotation", "noun", "movement around a central point", "movement around a central point"],
  ["transition", "noun", "a change from one state to another", "a change from one state to another"],
  ["anchor", "noun", "something that holds attention or position", "something that holds attention or position"],
  ["ratio", "noun", "a relationship between two quantities", "a relationship between two quantities"],
  ["rhythm", "noun", "a repeated beat, movement, or pattern", "a repeated beat, movement, or pattern"],
  ["cadence", "noun", "a rhythm or flow in movement or speech", "a rhythm or flow in movement or speech"],
  ["repetition", "noun", "the act of repeating something", "the act of repeating something"],
  ["variation", "noun", "a change within a repeated pattern", "a change within a repeated pattern"],
  ["orientation", "noun", "direction, position, or adjustment to context", "direction, position, or adjustment to context"],
  ["geometry", "noun", "the shape and mathematical structure of forms", "the shape and mathematical structure of forms"],
  ["tension", "noun", "a force or feeling of strain", "a force or feeling of strain"],
  ["equilibrium", "noun", "a state of balance", "a state of balance"],
  ["compression", "noun", "the act of pressing into a smaller space", "the act of pressing into a smaller space"],
  ["extension", "noun", "the act of reaching outward or making longer", "the act of reaching outward or making longer"],
  ["classification", "noun", "the act of arranging things into groups", "the act of arranging things into groups"],
  ["calibrate", "verb", "to adjust carefully for accuracy or balance", "to adjust carefully for accuracy or balance"],
] as const;

const expandedWordBank: WordEntry[] = expandedWordData.map(([word, part, definition, cn]) => ({
  word,
  part,
  definition,
  cn,
  example: `The visual study uses ${word} as a cue for seeing and remembering.`,
}));

const advancedWordData = [
  ["perceive", "verb", "to notice, see, or understand something", "to notice, see, or understand something"],
  ["comprehend", "verb", "to understand something fully", "to understand something fully"],
  ["retain", "verb", "to keep information or memory", "to keep information or memory"],
  ["retrieve", "verb", "to bring information back from memory", "to bring information back from memory"],
  ["encode", "verb", "to turn information into a form that can be stored", "to turn information into a form that can be stored"],
  ["decode", "verb", "to interpret or translate a message", "to interpret or translate a message"],
  ["associate", "verb", "to connect one thing with another", "to connect one thing with another"],
  ["distinguish", "verb", "to recognize a difference", "to recognize a difference"],
  ["reason", "verb", "to think logically toward a conclusion", "to think logically toward a conclusion"],
  ["support", "verb", "to give evidence or help", "to give evidence or help"],
  ["refute", "verb", "to prove an idea wrong", "to prove an idea wrong"],
  ["hypothesize", "verb", "to suggest a possible explanation", "to suggest a possible explanation"],
  ["demonstrate", "verb", "to show clearly with evidence or example", "to show clearly with evidence or example"],
  ["persuade", "verb", "to cause someone to believe or do something", "to cause someone to believe or do something"],
  ["emphasize", "verb", "to give special importance to something", "to give special importance to something"],
  ["indicate", "verb", "to point out or show", "to point out or show"],
  ["reveal", "verb", "to make something known or visible", "to make something known or visible"],
  ["conceal", "verb", "to hide something", "to hide something"],
  ["represent", "verb", "to stand for or depict something", "to stand for or depict something"],
  ["signify", "verb", "to mean or suggest something", "to mean or suggest something"],
  ["denote", "verb", "to be the direct meaning of a word or sign", "to be the direct meaning of a word or sign"],
  ["connote", "verb", "to suggest an additional feeling or meaning", "to suggest an additional feeling or meaning"],
  ["contextualize", "verb", "to place something in its surrounding situation", "to place something in its surrounding situation"],
  ["problematize", "verb", "to show that something is more complex than it seems", "to show that something is more complex than it seems"],
  ["assess", "verb", "to judge carefully", "to judge carefully"],
  ["scrutinize", "verb", "to examine very closely", "to examine very closely"],
  ["survey", "verb", "to look over broadly or study systematically", "to look over broadly or study systematically"],
  ["map", "verb", "to show relationships or positions", "to show relationships or positions"],
  ["chart", "verb", "to record or show development", "to record or show development"],
  ["organize", "verb", "to arrange into a clear order", "to arrange into a clear order"],
  ["prioritize", "verb", "to decide what is most important", "to decide what is most important"],
  ["arrange", "verb", "to put things into order", "to put things into order"],
  ["connect", "verb", "to join or relate things", "to join or relate things"],
  ["relate", "verb", "to show a connection", "to show a connection"],
  ["transform", "verb", "to change form or character", "to change form or character"],
  ["translate", "verb", "to express in another language or form", "to express in another language or form"],
  ["adapt", "verb", "to change to fit new conditions", "to change to fit new conditions"],
  ["expand", "verb", "to make larger or wider", "to make larger or wider"],
  ["compress", "verb", "to press into a smaller form", "to press into a smaller form"],
  ["resolve", "verb", "to solve or make clear", "to solve or make clear"],
  ["reconstruct", "verb", "to build or imagine again from pieces", "to build or imagine again from pieces"],
  ["deconstruct", "verb", "to take apart to examine hidden structures", "to take apart to examine hidden structures"],
  ["navigate", "verb", "to find a way through something", "to find a way through something"],
  ["orient", "verb", "to position or adjust toward a direction", "to position or adjust toward a direction"],
  ["notice", "verb", "to become aware of something", "to become aware of something"],
  ["register", "verb", "to notice or record something", "to notice or record something"],
  ["recognize", "verb", "to identify something known before", "to identify something known before"],
  ["memorize", "verb", "to learn something so it can be recalled", "to learn something so it can be recalled"],
  ["rehearse", "verb", "to practice repeatedly", "to practice repeatedly"],
  ["internalize", "verb", "to make an idea part of your thinking", "to make an idea part of your thinking"],
  ["perception", "noun", "the process of seeing or understanding", "the process of seeing or understanding"],
  ["cognition", "noun", "mental processes of knowing and thinking", "mental processes of knowing and thinking"],
  ["recall", "noun", "the ability to remember", "the ability to remember"],
  ["retention", "noun", "the ability to keep information", "the ability to keep information"],
  ["recognition", "noun", "identifying something known before", "identifying something known before"],
  ["association", "noun", "a connection between ideas", "a connection between ideas"],
  ["schema", "noun", "a mental structure for organizing knowledge", "a mental structure for organizing knowledge"],
  ["archetype", "noun", "a typical original pattern or model", "a typical original pattern or model"],
  ["analogy", "noun", "a comparison that explains similarity", "a comparison that explains similarity"],
  ["metaphor", "noun", "a figure of speech using one thing to mean another", "a figure of speech using one thing to mean another"],
  ["motif", "noun", "a repeated idea, image, or pattern", "a repeated idea, image, or pattern"],
  ["theme", "noun", "a central idea or subject", "a central idea or subject"],
  ["thesis", "noun", "a central claim or argument", "a central claim or argument"],
  ["claim", "noun", "a statement presented as true", "a statement presented as true"],
  ["counterpoint", "noun", "a contrasting but related idea", "a contrasting but related idea"],
  ["paradox", "noun", "a statement that seems contradictory but may be true", "a statement that seems contradictory but may be true"],
  ["ambiguity", "noun", "the quality of having more than one meaning", "the quality of having more than one meaning"],
  ["complexity", "noun", "the state of having many connected parts", "the state of having many connected parts"],
  ["cohesion", "noun", "the quality of holding together", "the quality of holding together"],
  ["continuity", "noun", "smooth connection through time or space", "smooth connection through time or space"],
  ["discontinuity", "noun", "a break in connection or sequence", "a break in connection or sequence"],
  ["causality", "noun", "the relationship of cause and effect", "the relationship of cause and effect"],
  ["correlation", "noun", "a relationship between two changing things", "a relationship between two changing things"],
  ["patterning", "noun", "the creation or presence of repeated structure", "the creation or presence of repeated structure"],
  ["hierarchy", "noun", "an order from most to least important", "an order from most to least important"],
  ["taxonomy", "noun", "a system for naming and organizing categories", "a system for naming and organizing categories"],
  ["calibration", "noun", "careful adjustment for accuracy", "careful adjustment for accuracy"],
  ["precision", "noun", "exactness and careful detail", "exactness and careful detail"],
  ["accuracy", "noun", "correctness or closeness to truth", "correctness or closeness to truth"],
  ["fluency", "noun", "smooth and natural skill or expression", "smooth and natural skill or expression"],
  ["literacy", "noun", "the ability to read, write, or understand a field", "the ability to read, write, or understand a field"],
  ["lexicon", "noun", "the vocabulary of a language or field", "the vocabulary of a language or field"],
  ["syntax", "noun", "the rules for arranging words or parts", "the rules for arranging words or parts"],
  ["semantics", "noun", "the study or meaning of words and signs", "the study or meaning of words and signs"],
  ["pragmatics", "noun", "meaning shaped by context and use", "meaning shaped by context and use"],
  ["discourse", "noun", "connected communication or a field of discussion", "connected communication or a field of discussion"],
  ["narrative", "noun", "a story or way of arranging events", "a story or way of arranging events"],
  ["description", "noun", "words that tell what something is like", "words that tell what something is like"],
  ["explanation", "noun", "a statement that makes something understandable", "a statement that makes something understandable"],
  ["interpretation", "noun", "a way of explaining meaning", "a way of explaining meaning"],
  ["insight", "noun", "a deep or sudden understanding", "a deep or sudden understanding"],
  ["attention", "noun", "focused mental notice", "focused mental notice"],
  ["intention", "noun", "a purpose or plan", "a purpose or plan"],
  ["meaning", "noun", "what something expresses or suggests", "what something expresses or suggests"],
  ["memory", "noun", "the ability to store and recall experience", "the ability to store and recall experience"],
  ["impression", "noun", "a feeling or idea left by something", "a feeling or idea left by something"],
  ["notation", "noun", "a system of written signs or notes", "a system of written signs or notes"],
  ["caption", "noun", "text that explains an image", "text that explains an image"],
  ["label", "noun", "a word or phrase used to identify something", "a word or phrase used to identify something"],
  ["index", "noun", "a sign, list, or pointer to information", "a sign, list, or pointer to information"],
  ["archive", "noun", "a stored collection of records", "a stored collection of records"],
  ["catalog", "noun", "an organized list of items", "an organized list of items"],
  ["motion", "noun", "movement or the act of moving", "movement or the act of moving"],
  ["gesture", "noun", "a movement that expresses meaning", "a movement that expresses meaning"],
  ["posture", "noun", "the position of the body or an attitude", "the position of the body or an attitude"],
  ["viewpoint", "noun", "a way of seeing or judging something", "a way of seeing or judging something"],
  ["trajectory", "noun", "the path followed by a moving thing", "the path followed by a moving thing"],
  ["velocity", "noun", "speed in a particular direction", "speed in a particular direction"],
  ["momentum", "noun", "force gained by movement or progress", "force gained by movement or progress"],
  ["acceleration", "noun", "increase in speed", "increase in speed"],
  ["friction", "noun", "resistance between surfaces or people", "resistance between surfaces or people"],
  ["gravity", "noun", "the force pulling things downward or seriousness", "the force pulling things downward or seriousness"],
  ["resistance", "noun", "opposition to force or change", "opposition to force or change"],
  ["pressure", "noun", "force applied to something", "force applied to something"],
  ["flow", "noun", "smooth continuous movement", "smooth continuous movement"],
  ["current", "noun", "a flowing movement of water, air, or thought", "a flowing movement of water, air, or thought"],
  ["pulse", "noun", "a repeated beat or signal of life", "a repeated beat or signal of life"],
  ["beat", "noun", "a regular rhythmic unit", "a regular rhythmic unit"],
  ["tempo", "noun", "the speed of rhythm or action", "the speed of rhythm or action"],
  ["duration", "noun", "the length of time something lasts", "the length of time something lasts"],
  ["pause", "noun", "a short stop", "a short stop"],
  ["delay", "noun", "a period of waiting", "a period of waiting"],
  ["echo", "noun", "a repeated sound, image, or idea", "a repeated sound, image, or idea"],
  ["remnant", "noun", "a small remaining part of something", "a small remaining part of something"],
  ["residue", "noun", "something left after the main part is gone", "something left after the main part is gone"],
  ["imprint", "noun", "a mark made by pressure or memory", "a mark made by pressure or memory"],
  ["footprint", "noun", "a mark left by a foot or activity", "a mark left by a foot or activity"],
  ["pathway", "noun", "a route or way of moving through", "a route or way of moving through"],
  ["route", "noun", "a way from one place to another", "a way from one place to another"],
  ["channel", "noun", "a passage through which something moves", "a passage through which something moves"],
  ["stream", "noun", "a continuous flow", "a continuous flow"],
  ["drift", "noun", "slow movement without a fixed direction", "slow movement without a fixed direction"],
  ["sway", "noun", "a slow movement from side to side", "a slow movement from side to side"],
  ["tilt", "noun", "a sloping position", "a sloping position"],
  ["spiral", "noun", "a curve winding around a center", "a curve winding around a center"],
  ["arc", "noun", "a curved path or shape", "a curved path or shape"],
  ["fold", "noun", "a bend or layer made by turning material", "a bend or layer made by turning material"],
  ["crease", "noun", "a line made by folding or pressure", "a line made by folding or pressure"],
  ["seam", "noun", "a line where two parts join", "a line where two parts join"],
  ["joint", "noun", "a place where parts connect", "a place where parts connect"],
  ["node", "noun", "a point in a network", "a point in a network"],
  ["matrix", "noun", "a surrounding structure or grid", "a surrounding structure or grid"],
  ["mesh", "noun", "a network of connected threads or lines", "a network of connected threads or lines"],
  ["lattice", "noun", "a structure of crossed strips or lines", "a structure of crossed strips or lines"],
  ["stratum", "noun", "one layer in a set of layers", "one layer in a set of layers"],
  ["substrate", "noun", "an underlying layer or base", "an underlying layer or base"],
  ["medium", "noun", "the material or method used for expression", "the material or method used for expression"],
  ["artifact", "noun", "an object made or shaped by human work", "an object made or shaped by human work"],
  ["specimen", "noun", "an example used for study", "an example used for study"],
  ["fragment", "noun", "a small broken piece", "a small broken piece"],
  ["element", "noun", "a basic part of a whole", "a basic part of a whole"],
  ["component", "noun", "one part of a larger system", "one part of a larger system"],
  ["mechanism", "noun", "a process or system that makes something work", "a process or system that makes something work"],
  ["interface", "noun", "a point where systems meet or interact", "a point where systems meet or interact"],
  ["limen", "noun", "a boundary or threshold of perception", "a boundary or threshold of perception"],
  ["portal", "noun", "an entrance or gateway", "an entrance or gateway"],
  ["oculus", "noun", "a round opening or eye-like architectural feature", "a round opening or eye-like architectural feature"],
  ["window", "noun", "an opening for seeing through", "an opening for seeing through"],
  ["screen", "noun", "a surface for display or separation", "a surface for display or separation"],
  ["display", "noun", "a presentation of information or objects", "a presentation of information or objects"],
  ["exhibit", "noun", "an object or presentation shown publicly", "an object or presentation shown publicly"],
  ["gallery", "noun", "a place or collection for viewing art", "a place or collection for viewing art"],
  ["collection", "noun", "a group of gathered items", "a group of gathered items"],
  ["series", "noun", "a set of related things in order", "a set of related things in order"],
  ["edition", "noun", "a particular version or issue", "a particular version or issue"],
  ["version", "noun", "one form of something", "one form of something"],
  ["cycle", "noun", "a repeated sequence of stages", "a repeated sequence of stages"],
  ["mockup", "noun", "a simple model used to test a design", "a simple model used to test a design"],
  ["draft", "noun", "an early version of writing or design", "an early version of writing or design"],
  ["redraft", "noun", "a new version made by rewriting", "a new version made by rewriting"],
  ["polish", "noun", "final refinement and finish", "final refinement and finish"],
  ["finish", "noun", "the final surface or completion", "the final surface or completion"],
  ["craft", "noun", "skillful making or technique", "skillful making or technique"],
  ["field", "noun", "an area of study, work, or activity", "an area of study, work, or activity"],
  ["practice", "noun", "repeated action for learning or skill", "repeated action for learning or skill"],
  ["habit", "noun", "a repeated way of acting", "a repeated way of acting"],
  ["routine", "noun", "a regular sequence of actions", "a regular sequence of actions"],
  ["ritual", "noun", "a repeated action with meaning", "a repeated action with meaning"],
  ["method", "noun", "an organized way of doing something", "an organized way of doing something"],
  ["strategy", "noun", "a plan for reaching a goal", "a plan for reaching a goal"],
  ["technique", "noun", "a skillful method", "a skillful method"],
  ["process", "noun", "a series of actions that produce change", "a series of actions that produce change"],
  ["progression", "noun", "movement through stages", "movement through stages"],
  ["milestone", "noun", "an important point in development", "an important point in development"],
  ["benchmark", "noun", "a standard for comparison", "a standard for comparison"],
  ["feedback", "noun", "information given in response to performance", "information given in response to performance"],
  ["refinement", "noun", "the act of making something more precise or polished", "the act of making something more precise or polished"],
  ["amendment", "noun", "a change made to improve or correct something", "a change made to improve or correct something"],
  ["mastery", "noun", "a high level of skill or understanding", "a high level of skill or understanding"],
  ["competence", "noun", "the ability to do something well enough", "the ability to do something well enough"],
  ["confidence", "noun", "belief in ability or truth", "belief in ability or truth"],
  ["curiosity", "noun", "a desire to know or learn", "a desire to know or learn"],
  ["steadiness", "noun", "calm and consistent control", "calm and consistent control"],
  ["patience", "noun", "the ability to wait or continue calmly", "the ability to wait or continue calmly"],
  ["persistence", "noun", "continuing despite difficulty", "continuing despite difficulty"],
  ["attentiveness", "noun", "careful and sustained attention", "careful and sustained attention"],
  ["awareness", "noun", "knowledge or notice of something", "knowledge or notice of something"],
  ["attunement", "noun", "sensitive adjustment to mood, rhythm, or context", "sensitive adjustment to mood, rhythm, or context"],
  ["discernment", "noun", "the ability to judge and notice subtle differences", "the ability to judge and notice subtle differences"],
  ["stamina", "noun", "the strength to continue effort over time", "the strength to continue effort over time"],
] as const;

const advancedWordBank: WordEntry[] = advancedWordData.map(([word, part, definition, cn]) => ({
  word,
  part,
  definition,
  cn,
  example: `The learning page uses ${word} to connect language, image, and memory.`,
}));

const examWordLines = `
abandon|CET-4|放弃；遗弃
ability|CET-4|能力；才能
abroad|CET-4|在国外；到海外
absence|CET-4|缺席；缺乏
accept|CET-4|接受；认可
access|CET-4|通道；使用权
account|CET-4|账户；说明；叙述
achieve|CET-4|实现；取得
active|CET-4|积极的；活跃的
addition|CET-4|增加；附加物
admire|CET-4|钦佩；欣赏
admit|CET-4|承认；准许进入
adult|CET-4|成年人；成年的
advantage|CET-4|优势；有利条件
advertise|CET-4|做广告；宣传
advice|CET-4|建议；忠告
afford|CET-4|负担得起；提供
agency|CET-4|机构；代理处
agree|CET-4|同意；一致
agriculture|CET-4|农业
aid|CET-4|援助；帮助
aim|CET-4|目标；瞄准
alarm|CET-4|警报；惊慌
alike|CET-4|相似的；同样地
allow|CET-4|允许；准许
alter|CET-4|改变；修改
ancient|CET-4|古代的；古老的
announce|CET-4|宣布；通告
annual|CET-6|每年的；年度的
anxiety|CET-6|焦虑；担心
appeal|CET-6|呼吁；吸引力
appear|CET-4|出现；显得
apply|CET-4|申请；应用
appoint|CET-6|任命；约定
approach|CET-6|方法；接近
argue|CET-4|争论；论证
arise|CET-6|出现；产生
arrival|CET-4|到达；到来
article|CET-4|文章；物品
aspect|CET-6|方面；层面
attempt|CET-6|尝试；企图
attract|CET-4|吸引
audience|CET-4|观众；听众
author|CET-4|作者
average|CET-4|平均的；普通的
avoid|CET-4|避免；避开
aware|CET-4|意识到的；察觉的
balance|CET-4|平衡；均衡
basic|CET-4|基本的；基础的
behavior|CET-4|行为；举止
belief|CET-4|信念；相信
benefit|CET-4|利益；好处
biology|CET-4|生物学
border|CET-4|边界；边境
borrow|CET-4|借入；借用
brief|CET-4|简短的；摘要
budget|CET-4|预算
campus|CET-4|校园
cancel|CET-4|取消
candidate|CET-6|候选人；应试者
capable|CET-6|有能力的
capital|CET-4|首都；资本；大写字母
career|CET-6|职业；事业
casual|CET-4|随意的；偶然的
cause|CET-4|原因；导致
celebrate|CET-4|庆祝
challenge|CET-6|挑战
character|CET-6|性格；角色；字符
charge|CET-6|收费；指控；负责
cheerful|CET-4|愉快的；开朗的
climate|CET-4|气候；风气
combine|CET-4|结合；联合
comfort|CET-4|安慰；舒适
command|CET-4|命令；掌握
commerce|CET-6|商业；贸易
compare|CET-4|比较
compete|CET-4|竞争
complex|CET-6|复杂的；综合体
concern|CET-6|关心；担忧；涉及
conduct|CET-6|实施；行为
confirm|CET-6|确认；证实
connect|CET-4|连接；联系
consider|CET-4|考虑；认为
contact|CET-4|联系；接触
contain|CET-4|包含；容纳
continue|CET-4|继续
contribute|CET-6|贡献；促成
control|CET-4|控制；管理
convenient|CET-4|方便的
convince|CET-6|使相信；说服
cooperate|CET-6|合作
courage|CET-4|勇气
creative|CET-6|有创造力的
culture|CET-6|文化
curious|CET-4|好奇的
damage|CET-4|损害；损失
debate|CET-6|辩论；讨论
debt|CET-6|债务；欠款
decide|CET-4|决定
declare|CET-6|宣布；声明
decline|CET-6|下降；拒绝
decorate|CET-4|装饰
defend|CET-6|防御；辩护
delay|CET-4|延迟；耽搁
demand|CET-6|需求；要求
deny|CET-6|否认；拒绝
depend|CET-4|依靠；取决于
describe|CET-4|描述
desire|CET-4|渴望；愿望
determine|CET-6|决定；确定
develop|CET-4|发展；开发
device|CET-4|设备；装置
differ|CET-4|不同；有区别
difficult|CET-4|困难的
direction|CET-4|方向；指导
discover|CET-4|发现
discuss|CET-4|讨论
disease|CET-4|疾病
distance|CET-4|距离
divide|CET-4|分开；除以
domestic|CET-6|国内的；家庭的
doubt|CET-4|怀疑；疑问
duty|CET-4|责任；职责
economy|CET-6|经济；节约
educate|CET-4|教育
effect|CET-6|影响；效果
effort|CET-6|努力
elderly|CET-4|年长的；老年的
element|CET-4|元素；要素
employ|CET-4|雇用；使用
encourage|CET-4|鼓励
energy|CET-4|能量；精力
engine|CET-4|发动机；引擎
enjoy|CET-4|享受；喜欢
environment|CET-4|环境
equal|CET-4|相等的；平等的
escape|CET-4|逃离；避开
establish|CET-6|建立；确立
event|CET-4|事件；活动
evidence|CET-6|证据
exact|CET-4|准确的；精确的
examine|CET-6|检查；考试
exchange|CET-6|交换；交流
excite|CET-4|使兴奋；激发
expand|CET-6|扩大；扩展
expect|CET-4|期待；预计
expense|CET-4|费用；开支
explain|CET-4|解释
explore|CET-6|探索
express|CET-6|表达；快递的
extreme|CET-4|极端的
failure|CET-4|失败；故障
familiar|CET-4|熟悉的
fancy|CET-4|想象；花哨的
feature|CET-4|特征；特色
federal|CET-4|联邦的
feeling|CET-4|感觉；情感
figure|CET-4|数字；人物；图形
finance|CET-4|财政；金融
fluent|CET-4|流利的
foreign|CET-4|外国的
formal|CET-4|正式的
former|CET-4|以前的；前者
freedom|CET-4|自由
frequent|CET-4|频繁的
function|CET-4|功能；作用
gain|CET-4|获得；增加
general|CET-4|一般的；将军
generous|CET-4|慷慨的
graduate|CET-4|毕业；毕业生
habit|CET-4|习惯
harmful|CET-4|有害的
hesitate|CET-4|犹豫
honor|CET-4|荣誉；尊敬
host|CET-4|主人；主持
household|CET-4|家庭；家用的
identity|CET-4|身份；特征
ignore|CET-4|忽视
impact|CET-4|影响；冲击
impress|CET-4|给…留下印象
improve|CET-4|改善；提高
income|CET-4|收入
increase|CET-4|增加
industry|CET-4|工业；行业
inform|CET-4|通知；告知
injury|CET-4|伤害；损伤
insist|CET-4|坚持
inspire|CET-4|激励；启发
instance|CET-4|例子；情况
instead|CET-4|代替；反而
institute|CET-4|学院；机构
instrument|CET-4|工具；乐器
intend|CET-4|打算；意图
interest|CET-4|兴趣；利益；利息
interview|CET-4|采访；面试
involve|CET-4|涉及；包含
journey|CET-4|旅行；历程
judge|CET-4|判断；法官
junior|CET-4|低年级的；年少的
knowledge|CET-4|知识
labor|CET-4|劳动；劳工
lack|CET-4|缺乏
language|CET-4|语言
legal|CET-4|法律的；合法的
level|CET-4|水平；层级
liberty|Contest|自由；个人自由权
likely|CET-4|可能的
limit|CET-4|限制；限度
local|CET-4|当地的；本地的
locate|CET-4|定位；位于
logical|CET-4|合乎逻辑的
maintain|CET-4|维持；维修
major|CET-4|主要的；专业
manage|CET-4|管理；设法做到
manner|CET-4|方式；礼貌
market|CET-4|市场
material|CET-4|材料；物质
measure|CET-4|测量；措施
medical|CET-4|医学的；医疗的
memory|CET-4|记忆
mental|CET-4|心理的；精神的
method|CET-4|方法
mistake|CET-4|错误
modern|CET-4|现代的
moral|Contest|道德的；寓意
native|CET-4|本地的；母语的
necessary|CET-4|必要的
negative|CET-4|消极的；否定的
neighbor|CET-4|邻居
notice|CET-4|注意到；通知
obvious|CET-4|明显的
offer|CET-4|提供；提议
official|CET-4|官方的；官员
operate|CET-4|操作；运转
opinion|CET-4|意见；观点
ordinary|CET-4|普通的
organize|CET-4|组织；整理
origin|CET-4|起源；来源
patient|CET-4|病人；耐心的
peaceful|CET-4|和平的；平静的
percent|CET-4|百分之…
period|CET-4|时期；句号
permit|CET-4|允许；许可证
persuade|CET-4|说服
physical|CET-4|身体的；物理的
planet|CET-4|行星
pleasure|CET-4|愉快；乐趣
policy|CET-4|政策
popular|CET-4|流行的；受欢迎的
population|CET-4|人口
position|CET-4|位置；职位
positive|CET-4|积极的；肯定的
possible|CET-4|可能的
practical|CET-4|实际的；实用的
predict|CET-4|预测
prefer|CET-4|更喜欢
prepare|CET-4|准备
pressure|CET-4|压力
prevent|CET-4|阻止；预防
previous|CET-4|先前的
principle|Contest|原则；基本准则
private|CET-4|私人的；私立的
process|CET-4|过程；处理
produce|CET-4|生产；产生
product|CET-4|产品
profession|CET-4|职业；行业
progress|CET-4|进步；进展
proper|CET-4|合适的；恰当的
protect|CET-4|保护
provide|CET-4|提供
public|CET-4|公共的；公众
purpose|CET-4|目的
quality|CET-4|质量；品质
quantity|CET-4|数量
rapid|CET-4|快速的
realize|CET-4|意识到；实现
receive|CET-4|收到；接待
recent|CET-4|最近的
reduce|CET-4|减少；降低
refuse|CET-4|拒绝
regular|CET-4|规则的；定期的
relate|CET-4|联系；讲述
release|CET-4|释放；发布
remain|CET-4|保持；剩余
remark|CET-4|评论；说
remind|CET-4|提醒
remove|CET-4|移除；搬走
repair|CET-4|修理
repeat|CET-4|重复
replace|CET-4|替换
require|CET-4|需要；要求
research|CET-4|研究
resource|CET-4|资源
respect|CET-4|尊重；方面
responsible|CET-4|负责的
result|CET-4|结果；导致
review|CET-4|复习；评论
risk|CET-4|风险
routine|CET-4|常规；例行程序
satisfy|CET-4|使满意；满足
scarce|Contest|稀缺的；不足的
science|CET-4|科学
search|CET-4|搜索；寻找
secure|CET-4|安全的；确保
select|CET-4|选择
sensitive|CET-4|敏感的
separate|CET-4|分开的；分离
serious|CET-4|严肃的；严重的
service|CET-4|服务
share|CET-4|分享；份额
similar|CET-4|相似的
simple|CET-4|简单的
social|CET-4|社会的；社交的
society|CET-4|社会
solve|CET-4|解决
source|CET-4|来源
specific|CET-4|具体的；特定的
standard|CET-4|标准
state|CET-4|状态；国家；陈述
steady|CET-4|稳定的
stress|CET-4|压力；强调
strict|CET-4|严格的
subject|CET-4|主题；科目
success|CET-4|成功
suffer|CET-4|遭受；受苦
suggest|CET-4|建议；暗示
support|CET-4|支持
suppose|CET-4|假设；认为
surface|CET-4|表面
survey|CET-4|调查；概览
survive|CET-4|幸存；继续存在
system|CET-4|系统
talent|CET-4|才能；人才
task|CET-4|任务
technique|CET-4|技巧；技术
theory|CET-4|理论
therefore|CET-4|因此
traffic|CET-4|交通
transfer|CET-4|转移；转学
treat|CET-4|对待；治疗
typical|CET-4|典型的
understand|CET-4|理解
union|CET-4|联合；工会
unique|Contest|独特的；唯一的
university|CET-4|大学
value|CET-4|价值；重视
view|CET-4|观点；景色
volunteer|CET-4|志愿者
abstract|CET-6|抽象的；摘要
accurate|CET-6|准确的；精确的
acknowledge|CET-6|承认；致谢
acquire|CET-6|获得；习得
adequate|CET-6|足够的；适当的
adjust|CET-6|调整；适应
administration|CET-6|管理；行政部门
advanced|CET-6|高级的；先进的
advocate|CET-6|提倡；拥护者
affect|CET-6|影响；作用于
agenda|CET-6|议程；待办事项
aggressive|CET-6|有进取心的；侵略性的
alternative|CET-6|替代的；可供选择的
ambiguous|CET-6|模糊的；有歧义的
analysis|CET-6|分析
analytical|CET-6|分析性的
anticipate|CET-6|预期；预料
apparent|CET-6|明显的；表面上的
approve|CET-6|批准；赞成
approximate|CET-6|近似的；大概的
arbitrary|CET-6|任意的；武断的
assess|CET-6|评估；评价
assign|CET-6|分配；指定
assume|CET-6|假设；承担
assure|CET-6|保证；使确信
attach|CET-6|附上；使依附
attain|CET-6|达到；获得
attitude|CET-6|态度
authority|CET-6|权威；当局
available|CET-6|可获得的；有空的
beneficial|CET-6|有益的
bias|CET-6|偏见；倾向
capacity|CET-6|能力；容量
category|CET-6|类别
cease|CET-6|停止；终止
circumstance|CET-6|情况；环境
cite|CET-6|引用；举例
civil|CET-6|公民的；民事的；文明的
clarify|CET-6|澄清；阐明
collapse|CET-6|倒塌；崩溃
colleague|CET-6|同事
commission|CET-6|委员会；委托
commit|CET-6|承诺；犯下
compatible|CET-6|兼容的；合得来的
compensate|CET-6|补偿；弥补
competent|CET-6|有能力的；胜任的
component|CET-6|组成部分；组件
comprehensive|CET-6|全面的；综合的
conceive|CET-6|构想；认为
concentrate|CET-6|集中；浓缩
conclude|CET-6|得出结论；结束
confer|CET-6|授予；商议
confine|CET-6|限制； confined于
conflict|CET-6|冲突；矛盾
conform|CET-6|遵守；符合
consent|CET-6|同意；许可
consequent|CET-6|随之发生的；结果的
considerable|CET-6|相当大的；重要的
consist|CET-6|由…组成；在于
consistent|CET-6|一致的；持续的
constant|CET-6|持续的；常数
constitute|CET-6|构成；组成
constraint|CET-6|限制；约束
consult|CET-6|咨询；查阅
consume|CET-6|消耗；消费
contemporary|CET-6|当代的；同时代的
contract|CET-6|合同；收缩
contradict|CET-6|反驳；与…矛盾
contrary|CET-6|相反的
controversy|CET-6|争议；争论
coordinate|CET-6|协调；坐标
core|CET-6|核心；核心的
corporate|CET-6|公司的；团体的
correspond|CET-6|相一致；通信
criteria|CET-6|标准；准则
crucial|CET-6|关键的；至关重要的
currency|CET-6|货币；流通
dedicate|CET-6|奉献；致力于
deliberate|CET-6|故意的；深思熟虑的
demonstrate|CET-6|证明；展示
dense|CET-6|密集的；浓厚的
derive|CET-6|获得；起源于
detect|CET-6|发现；察觉
devote|CET-6|投入；献身
dimension|CET-6|维度；方面
diminish|CET-6|减少；削弱
distinct|CET-6|清楚的；不同的
distinguish|CET-6|区分；辨别
diverse|CET-6|多样的
dominate|CET-6|支配；占主导
draft|CET-6|草稿；起草
duration|CET-6|持续时间
elaborate|CET-6|详尽说明；精心制作的
eliminate|CET-6|消除；淘汰
emerge|CET-6|出现；显现
emphasize|CET-6|强调
encounter|CET-6|遭遇；遇到
enhance|CET-6|提高；增强
enormous|CET-6|巨大的
ensure|CET-6|确保
entity|CET-6|实体；存在物
equivalent|CET-6|等同的；等价物
essential|CET-6|必要的；本质的
estimate|CET-6|估计；评估
evaluate|CET-6|评价；评估
evident|CET-6|明显的
evolve|CET-6|进化；逐渐发展
exceed|CET-6|超过
exclude|CET-6|排除；不包括
exhibit|CET-6|展示；展品
explicit|CET-6|明确的；清楚的
exploit|CET-6|利用；开发；剥削
expose|CET-6|暴露；揭露
external|CET-6|外部的
facilitate|CET-6|促进；使便利
factor|CET-6|因素
flexible|CET-6|灵活的
fluctuate|CET-6|波动；起伏
format|CET-6|格式；安排
formulate|CET-6|制定；构想
foundation|CET-6|基础；基金会
framework|CET-6|框架；体系
fundamental|CET-6|根本的；基础的
generate|CET-6|产生；生成
global|CET-6|全球的；整体的
grant|CET-6|授予；补助金
guarantee|CET-6|保证；担保
hierarchy|CET-6|层级；等级制度
hypothesis|CET-6|假设
illustrate|CET-6|说明；举例阐明
implement|CET-6|实施；工具
imply|CET-6|暗示；意味着
impose|CET-6|强加；征收
incentive|CET-6|激励；刺激
incident|CET-6|事件；事变
incline|CET-6|倾向于；斜坡
incorporate|CET-6|包含；合并
inevitable|CET-6|不可避免的
infer|CET-6|推断；推论
influence|CET-6|影响；影响力
initial|CET-6|最初的；首字母
insight|CET-6|洞察力
inspect|CET-6|检查；视察
integrate|CET-6|整合；结合
interact|CET-6|互动；相互作用
interpret|CET-6|解释；口译
intervene|CET-6|干预；介入
intrinsic|CET-6|内在的；固有的
investigate|CET-6|调查；研究
isolate|CET-6|隔离；孤立
justify|CET-6|证明…合理
label|CET-6|标签；标注
legislation|CET-6|立法；法规
liberal|CET-6|自由的；开明的
manipulate|CET-6|操纵；巧妙处理
mechanism|CET-6|机制；机械装置
migrate|CET-6|迁移；移居
military|CET-6|军事的；军队
minimum|CET-6|最小值；最低限度
modify|CET-6|修改；调整
monitor|CET-6|监控；显示器
motivate|CET-6|激励；促动
mutual|CET-6|相互的；共同的
negate|CET-6|否定；取消
notion|CET-6|概念；想法
objective|CET-6|客观的；目标
obtain|CET-6|获得；取得
occupy|CET-6|占据；占用
occur|CET-6|发生；出现
orient|CET-6|使适应；定位
outcome|CET-6|结果；后果
output|CET-6|产出；输出
overall|CET-6|总体的；全部的
participate|CET-6|参与；参加
perceive|CET-6|感知；理解
perspective|CET-6|视角；观点；透视
phase|CET-6|阶段；时期
phenomenon|CET-6|现象
philosophy|CET-6|哲学；理念
potential|CET-6|潜在的；潜力
precede|CET-6|先于；在…之前
precise|CET-6|精确的；准确的
preliminary|CET-6|初步的；预备的
preserve|CET-6|保护；保存
presume|CET-6|假定；推测
primary|CET-6|主要的；初级的
priority|CET-6|优先事项
proceed|CET-6|继续进行；着手
prominent|CET-6|突出的；显著的
promote|CET-6|促进；提升
proportion|CET-6|比例；部分
prospect|CET-6|前景；可能性
protocol|CET-6|协议；礼仪
pursue|CET-6|追求；从事
radical|CET-6|根本的；激进的
range|CET-6|范围；排列
ratio|CET-6|比率；比例
rational|CET-6|理性的；合理的
recover|CET-6|恢复；重新获得
refine|CET-6|精炼；改进
reflect|CET-6|反映；反思
regulate|CET-6|管理；调节
reinforce|CET-6|加强；强化
reject|CET-6|拒绝；排斥
relevant|CET-6|相关的
reliable|CET-6|可靠的
represent|CET-6|代表；表现
resemble|CET-6|像；类似
resolve|CET-6|解决；决心
restrict|CET-6|限制；约束
retain|CET-6|保留；保持
reveal|CET-6|揭示；显示
revise|CET-6|修改；复习
revolution|CET-6|革命；重大变革
rigid|CET-6|僵硬的；严格的
schedule|CET-6|日程；安排
scope|CET-6|范围；余地
seek|CET-6|寻求；寻找
sequence|CET-6|顺序；序列
shift|CET-6|转变；轮班
signify|CET-6|表示；意味着
simulate|CET-6|模拟；假装
sophisticated|CET-6|复杂精密的；老练的
specify|CET-6|具体说明
stable|CET-6|稳定的
strategy|CET-6|策略；战略
strengthen|CET-6|加强；巩固
substitute|CET-6|替代；替代品
sufficient|CET-6|足够的
summary|CET-6|摘要；总结
sustain|CET-6|维持；支撑
symbol|CET-6|符号；象征
synthesis|CET-6|综合；合成
tackle|CET-6|处理；应对
temporary|CET-6|暂时的
terminal|CET-6|终端；末端的
thesis|CET-6|论文；论点
tolerate|CET-6|容忍；忍受
trace|CET-6|追踪；痕迹
tradition|CET-6|传统
transform|CET-6|转变；改造
transit|CET-6|运输；通过
transmit|CET-6|传送；传播
trigger|CET-6|触发；引起
ultimate|CET-6|最终的；根本的
undergo|CET-6|经历；遭受
undermine|CET-6|削弱；破坏
undertake|CET-6|承担；从事
uniform|CET-6|统一的；制服
valid|CET-6|有效的；有根据的
vary|CET-6|变化；不同
verify|CET-6|核实；验证
viable|CET-6|可行的；能存活的
virtual|CET-6|虚拟的；实质上的
visible|CET-6|可见的
voluntary|CET-6|自愿的
widespread|CET-6|广泛的；普遍的
aberration|Contest|偏差；异常现象
acumen|Contest|敏锐判断力；洞察力
aesthetic|Contest|审美的；美学的
affinity|Contest|亲和力；密切关系
allegory|Contest|寓言；象征叙事
alleviate|Contest|缓解；减轻
ambivalence|Contest|矛盾心理；摇摆态度
anachronism|Contest|时代错误；不合时宜之物
anomaly|Contest|异常；反常现象
anthology|Contest|选集；文选
archetypal|Contest|原型的；典型的
aspiration|Contest|抱负；渴望
assertion|Contest|断言；主张
autonomy|Contest|自主；自治
benevolent|Contest|仁慈的；善意的
brevity|Contest|简洁；简短
catalyst|Contest|催化因素；促成者
chronology|Contest|年代顺序；时间线
clandestine|Contest|秘密的；暗中的
cogent|Contest|有说服力的；令人信服的
coherence|Contest|连贯性；一致性
concession|Contest|让步；承认
conjecture|Contest|推测；猜想
connotation|Contest|内涵；隐含意义
contemplation|Contest|沉思；深思
convergence|Contest|汇合；趋同
cumulative|Contest|累积的；渐增的
discrepancy|Contest|差异；不一致
dilemma|Contest|困境；两难
discernment|Contest|辨识力；判断力
disparity|Contest|差距；悬殊
eloquence|Contest|雄辩；表达流畅
empathy|Contest|同理心；共情
empirical|Contest|经验主义的；基于实证的
enclave|Contest|飞地；特殊小群体
epitome|Contest|典范；缩影
existential|Contest|存在主义的；关乎存在的
formidable|Contest|强大的；令人敬畏的
fortitude|Contest|坚毅；刚毅
galvanize|Contest|激励；促使行动
gravitas|Contest|庄重；严肃气场
heuristic|Contest|启发式的；助发现的
idiosyncrasy|Contest|个人特质；怪癖
impartial|Contest|公正的；不偏不倚的
imperative|Contest|必要的；紧急命令
implicit|Contest|含蓄的；隐含的
indigenous|Contest|本土的；土生土长的
inertia|Contest|惯性；惰性
ingenuity|Contest|独创力；巧思
irony|Contest|反讽；讽刺意味
irretrievable|Contest|无法挽回的；无法找回的
juxtaposition|Contest|并置；对照摆放
labyrinth|Contest|迷宫；复杂系统
lucidity|Contest|清晰；明晰
melancholy|Contest|忧郁；哀愁
metaphorical|Contest|隐喻性的
mitigate|Contest|减轻；缓和
notorious|Contest|臭名昭著的
nuance|Contest|细微差别；微妙意味
obsolete|Contest|过时的；废弃的
paradox|Contest|悖论；矛盾命题
paradoxical|Contest|悖论式的；看似矛盾的
paradigm|Contest|范式；典型模式
perseverance|Contest|毅力；坚持不懈
pervasive|Contest|普遍存在的；弥漫的
plausibility|Contest|可信性；貌似合理
pragmatic|Contest|务实的；讲求实际的
precarious|Contest|不稳定的；危险的
precedent|Contest|先例；前例
propensity|Contest|倾向；习性
quintessential|Contest|典型的；精髓的
reconcile|Contest|调和；使和解
resilience|Contest|韧性；复原力
rhetoric|Contest|修辞；说服性表达
scrutiny|Contest|仔细审查；细察
serene|Contest|宁静的；安详的
sovereignty|Contest|主权；自主权
speculative|Contest|推测性的；投机性的
sporadic|Contest|零星的；偶发的
stagnant|Contest|停滞的；不流动的
subordinate|Contest|从属的；下级
succinct|Contest|简洁的；言简意赅的
tenacity|Contest|坚韧；顽强
tentative|Contest|试探性的；暂定的
transcend|Contest|超越；胜过
turbulent|Contest|动荡的；湍急的
ubiquitous|Contest|无处不在的
unconventional|Contest|非传统的；不寻常的
unequivocal|Contest|明确无误的
unveil|Contest|揭示；公开
versatile|Contest|多才多艺的；多用途的
vulnerable|Contest|脆弱的；易受伤害的
watershed|Contest|转折点；分水岭
whimsical|Contest|异想天开的；俏皮的
zeal|Contest|热情；热忱
`.trim().split("\n").filter(Boolean);

const examWordBank: WordEntry[] = examWordLines.map((line) => {
  const [word, level, cn] = line.split("|") as [string, WordLevel, string];
  return {
    word,
    level,
    part: level === "Contest" ? "advanced word" : "core word",
    definition: cn,
    cn,
    example: `${word} is part of the ${level} exam practice path.`,
  };
});

function mergeWordEntries(entries: WordEntry[]) {
  const merged = new Map<string, WordEntry>();
  entries.forEach((entry) => {
    const previous = merged.get(entry.word);
    if (!previous) {
      merged.set(entry.word, entry);
      return;
    }
    merged.set(entry.word, {
      ...entry,
      ...previous,
      cn: previous.cn ?? entry.cn,
      level: previous.level ?? entry.level,
    });
  });
  return Array.from(merged.values());
}

const wordBank: WordEntry[] = mergeWordEntries([...baseWordBank, ...expandedWordBank, ...advancedWordBank, ...examWordBank]);

const coreChineseGlossary: Record<string, string> = {};

const trialChineseGlossary: Record<string, string> = {
  absence: "缺席；缺乏；不存在",
  abstract: "抽象的；非写实的",
  acceleration: "加速；速度增加",
  accumulate: "积累；逐渐聚集",
  accuracy: "准确性；精确度",
  adapt: "适应；改编；调整",
  adaptive: "适应性的；能调整的",
  adjacent: "相邻的；毗邻的",
  alignment: "对齐；排列；一致",
  ambiguity: "含糊；歧义；多重含义",
  ambiguous: "模糊的；有歧义的",
  amendment: "修改；修正；改进",
  analogy: "类比；相似比较",
  analysis: "分析；细致研究",
  analytical: "分析性的；重逻辑的",
  anchor: "锚点；支撑注意力的核心",
  angle: "角度；观看方向",
  annotate: "注释；加批注",
  anxious: "焦虑的；担忧的",
  aperture: "光圈；孔径；进光口",
  arc: "弧线；弧形轨迹",
  archetype: "原型；典型模式",
  archival: "档案的；用于长期保存的",
  archive: "档案；资料库",
  argument: "论点；论证",
  arid: "干旱的；贫瘠的",
  arrange: "安排；排列",
  articulate: "清楚表达；阐明",
  artifact: "人工制品；作品遗留物",
  assess: "评估；判断",
  associate: "联想；关联",
  association: "联系；联想",
  assumption: "假设；未经证明的前提",
  assured: "自信的；确定的",
  asymmetry: "不对称；非对称平衡",
  atmospheric: "有氛围的；营造情绪的",
  attention: "注意力；关注",
  attentiveness: "专注；细致注意",
  attunement: "调谐；对情绪或节奏的敏感适应",
  austere: "朴素严峻的；无装饰的",
  awareness: "意识；察觉",
  axis: "轴线；组织形式的中心线",
  background: "背景；后景",
  backlight: "逆光；背后光源",
  balance: "平衡；稳定关系",
  beat: "节拍；律动单位",
  benchmark: "基准；参照标准",
  bias: "偏见；倾向性",
  bleak: "荒凉的；阴冷空旷的",
  blur: "模糊；虚化效果",
  boundary: "边界；界限",
  brooding: "阴郁沉思的；有压迫感的",
  buoyant: "轻快的；乐观有弹性的",
  cadence: "节奏；语流或动作韵律",
  calibrate: "校准；精细调整",
  calibration: "校准；精确调整",
  candid: "自然坦率的；非摆拍的",
  capricious: "反复无常的；变化突然的",
  caption: "图片说明；标题文字",
  catalog: "目录；清单",
  category: "类别；范畴",
  causality: "因果关系",
  center: "中心；核心点",
  channel: "通道；渠道",
  chart: "记录；绘制发展",
  chiaroscuro: "明暗对照法；强烈光影反差",
  claim: "主张；断言",
  clarify: "澄清；使清楚",
  clarity: "清晰度；明确性",
  classification: "分类；归类",
  classify: "分类；归入类别",
  cluster: "簇；群组",
  cognition: "认知；思维过程",
  coherent: "连贯的；清晰一致的",
  cohesion: "凝聚；连贯性",
  cohesive: "统一的；有整体感的",
  collection: "收藏；集合",
  compare: "比较；对照",
  competence: "能力；胜任力",
  complexity: "复杂性",
  component: "组成部分；组件",
  composed: "沉着的；构图稳定的",
  composition: "构图；组成；安排",
  comprehend: "充分理解",
  compress: "压缩；压紧",
  compressed: "压缩的；密集的",
  compression: "压缩；压紧",
  conceal: "隐藏；遮蔽",
  concept: "概念；观念",
  conclusion: "结论；推论结果",
  confidence: "信心；确信",
  connect: "连接；关联",
  connote: "隐含；暗示附加意义",
  contemplative: "沉思的；深思的",
  contextual: "语境相关的；依赖背景的",
  contextualize: "放入语境中理解",
  continuity: "连续性；连贯",
  contour: "轮廓；外形线",
  contraction: "收缩；缩紧",
  contradiction: "矛盾；冲突",
  contrast: "对比；反差",
  correlation: "相关性；相互关系",
  corridor: "走廊；通道",
  counterpoint: "对照观点；互补反差",
  craft: "技艺；工艺",
  crease: "折痕；压痕",
  criterion: "标准；判断依据",
  critique: "评论；批判性分析",
  crop: "裁切；裁剪画面",
  curiosity: "好奇心；求知欲",
  current: "流动；水流；趋势",
  curve: "曲线；弯曲线条",
  cycle: "循环；周期",
  decode: "解码；解读",
  deconstruct: "解构；拆解分析",
  deduce: "推断；演绎得出",
  define: "定义；明确说明",
  delay: "延迟；等待时间",
  deliberate: "有意的；谨慎的",
  delicate: "精细的；脆弱微妙的",
  demonstrate: "证明；展示",
  denote: "表示；直接指称",
  density: "密度；紧密程度",
  depth: "深度；纵深；意义层次",
  description: "描述；说明",
  detached: "疏离的；超然的",
  differentiate: "区分；辨别差异",
  diffuse: "扩散的；柔和分散的",
  dimensional: "有维度的；有空间感的",
  discern: "辨认；察觉细微差异",
  discernment: "辨识力；判断力",
  discontinuity: "不连续；断裂",
  discourse: "话语；论述领域",
  display: "展示；陈列",
  dissonant: "不协调的；刺耳的",
  distinction: "区别；差别",
  distinguish: "区分；辨别",
  distortion: "扭曲；失真",
  documentary: "纪实的；记录真实的",
  dormant: "休眠的；潜伏未动的",
  draft: "草稿；初稿",
  dreamy: "梦幻的；朦胧的",
  drift: "漂移；缓慢移动",
  duration: "持续时间",
  dynamic: "动态的；有活力的",
  earnest: "认真的；真诚的",
  echo: "回声；重复呼应",
  edge: "边缘；外沿",
  edition: "版本；期号",
  elaborate: "精细复杂的；详尽的",
  electric: "令人兴奋的；充满能量的",
  element: "元素；基本组成",
  elusive: "难以捕捉的；难以定义的",
  emergent: "逐渐显现的；新兴的",
  emphasis: "强调；重点",
  emphasize: "强调；突出",
  enclosure: "围合空间；封闭区域",
  encode: "编码；转化为可储存形式",
  ephemeral: "短暂的；转瞬即逝的",
  equilibrium: "平衡状态",
  euphoric: "欣快的；极度愉悦的",
  evaluate: "评价；评估",
  evidence: "证据；依据",
  evoke: "唤起；引发联想",
  examine: "仔细检查；审视",
  exhibit: "展品；展示物",
  exhilarated: "兴奋的；振奋的",
  expand: "扩展；扩大",
  expansion: "扩张；扩大",
  expansive: "开阔的；广阔的",
  explanation: "解释；说明",
  exposure: "曝光；受光量",
  extension: "延伸；扩展",
  exterior: "外部；外表面",
  fabric: "织物；结构肌理",
  facade: "立面；外观",
  feedback: "反馈；回应信息",
  fervent: "热切的；强烈真诚的",
  field: "领域；场域",
  figurative: "比喻的；非字面的",
  finish: "完成；表面处理",
  flow: "流动；连续运动",
  fluency: "流畅度；熟练表达",
  focal: "焦点的；核心的",
  focus: "焦点；注意中心",
  fold: "褶皱；折叠层",
  footprint: "足迹；活动留下的痕迹",
  foreground: "前景；近景",
  formulate: "构想；准确表达",
  fragile: "易碎的；脆弱的",
  fragment: "碎片；片段",
  fragmented: "碎片化的；分裂的",
  frame: "框架；画面边界",
  framework: "框架；组织结构",
  friction: "摩擦；阻力",
  gallery: "画廊；作品陈列空间",
  generalize: "概括；归纳",
  gentle: "温和的；轻柔的",
  geometry: "几何结构；形体关系",
  gesture: "手势；表达性动作",
  glacial: "冰冷的；极慢的",
  glare: "眩光；刺眼强光",
  gleam: "微光；闪光",
  glimmer: "微弱闪光",
  graceful: "优雅的；流畅美的",
  gradient: "渐变；梯度",
  grain: "颗粒；纹理颗粒感",
  granular: "颗粒状的；细节化的",
  gravity: "重力；严肃性",
  grid: "网格；结构线",
  habit: "习惯；惯常方式",
  halftone: "半色调；网点印刷效果",
  harmonious: "和谐的；协调的",
  haunting: "萦绕心头的；难忘的",
  hierarchy: "层级；重要性顺序",
  highlight: "高光；重点",
  horizon: "地平线；视野边界",
  horizontal: "水平的；横向的",
  hue: "色相；颜色种类",
  hushed: "安静的；低声静默的",
  hypothesis: "假设；待验证解释",
  hypothesize: "提出假设",
  illustrate: "说明；用例子或图像解释",
  immersed: "沉浸的；深度投入的",
  immersive: "沉浸式的；吸引全部注意的",
  implication: "含义；暗示结果",
  imply: "暗示；间接表明",
  impression: "印象；感受",
  imprint: "印记；压痕；记忆痕迹",
  incandescent: "白炽的；炽热发光的",
  index: "索引；指示符号",
  indicate: "指出；表明",
  infer: "推断；从证据得出",
  inference: "推论；推断结果",
  insight: "洞察；深刻理解",
  integrate: "整合；合并为整体",
  intention: "意图；目的",
  interface: "界面；交接点",
  interior: "内部；室内",
  internalize: "内化；使成为思维的一部分",
  interplay: "相互作用；交织影响",
  interpret: "解释；解读",
  interpretation: "解读；解释方式",
  interval: "间隔；间距",
  intimate: "亲密的；私人的",
  intricate: "复杂精细的",
  intuitive: "直觉的；凭感觉理解的",
  investigate: "调查；研究",
  iridescent: "虹彩的；随角度变色的",
  joint: "连接处；接合点",
  jubilant: "欢欣的；喜悦的",
  junction: "交汇处；连接点",
  justify: "证明合理；给出理由",
  juxtapose: "并置；对照摆放",
  kinetic: "运动的；有动感的",
  label: "标签；标识词",
  lattice: "格架；交叉网状结构",
  layer: "层；叠层",
  layered: "分层的；多层含义的",
  lens: "镜头；透镜",
  lexicon: "词汇；词库",
  limen: "阈限；感知边界",
  literacy: "读写能力；领域素养",
  literal: "字面的；直接的",
  lucid: "清晰的；明了的",
  luminous: "发光的；明亮的",
  map: "映射；标示关系",
  margin: "边距；空白边缘",
  mass: "体量；大块实体",
  mastery: "掌握；精通",
  matrix: "矩阵；母体结构",
  meaning: "意义；含义",
  mechanism: "机制；运作系统",
  meditative: "冥想般的；沉思的",
  medium: "媒介；表达材料",
  melancholy: "忧郁的；沉思伤感的",
  memorize: "记忆；背诵",
  memory: "记忆；回忆能力",
  mesh: "网状结构；交织",
  metaphor: "隐喻；比喻",
  method: "方法；步骤",
  meticulous: "一丝不苟的；细致的",
  milestone: "里程碑；重要节点",
  minimal: "极简的；最少的",
  mockup: "模型；样机",
  module: "模块；单元",
  momentum: "动量；推进力",
  monochrome: "单色的；黑白的",
  montage: "蒙太奇；拼接组合",
  monumental: "宏大的；纪念碑式的",
  motif: "母题；重复意象",
  motion: "运动；移动",
  mournful: "哀伤的；悲悼的",
  muted: "柔和低调的；弱化的",
  narrative: "叙事；故事结构",
  navigate: "导航；穿行；应对",
  network: "网络；连接系统",
  node: "节点；网络点",
  nostalgic: "怀旧的；念旧的",
  notation: "记号；标注系统",
  notice: "注意到；察觉",
  nuance: "细微差别；微妙意味",
  objective: "客观的；基于事实的",
  oblique: "倾斜的；间接的",
  observe: "观察；仔细观看",
  oculus: "圆窗；眼状开口",
  ominous: "不祥的；预示危险的",
  opaque: "不透明的；难懂的",
  opening: "开口；开始；机会",
  opulent: "华丽富足的；奢华的",
  organize: "组织；整理",
  orient: "定位；使朝向",
  orientation: "方向；定位；适应",
  ornate: "装饰华丽的；繁复的",
  outline: "轮廓；提纲",
  palette: "调色板；配色",
  panorama: "全景；广阔景象",
  paradox: "悖论；看似矛盾却可能真实的说法",
  parallel: "平行的；并列的",
  paraphrase: "改述；用不同说法表达",
  passage: "通道；段落",
  pathway: "路径；通路",
  patience: "耐心；持续等待的能力",
  pattern: "图案；模式",
  patterning: "图案化；重复结构",
  pause: "停顿；短暂停止",
  peaceful: "平静的；安宁的",
  pensive: "沉思的；忧思的",
  perceive: "感知；察觉；理解",
  perception: "感知；理解方式",
  peripheral: "边缘的；次要的",
  permanent: "永久的；长期存在的",
  persistence: "坚持；持续性",
  perspective: "视角；透视；观点",
  persuade: "说服；使相信",
  plane: "平面；层面",
  playful: "俏皮的；轻松有趣的",
  poised: "镇定的；平衡待发的",
  polish: "润色；打磨",
  portal: "入口；门户",
  portraiture: "肖像艺术；肖像摄影",
  posture: "姿态；立场",
  practice: "练习；实践",
  pragmatics: "语用学；语境中的意义",
  precise: "精确的；准确的",
  precision: "精确性；细节准确度",
  premise: "前提；论证基础",
  pressure: "压力；作用力",
  prioritize: "优先考虑；确定重点",
  pristine: "纯净崭新的；未受损的",
  problematize: "问题化；揭示复杂性",
  process: "过程；流程",
  progression: "进展；阶段推进",
  proportion: "比例；部分之间的大小关系",
  pulse: "脉搏；节拍信号",
  question: "质疑；审视",
  radiant: "光芒四射的；喜悦洋溢的",
  rapturous: "狂喜的；极度欢欣的",
  ratio: "比率；比例关系",
  rationale: "理由；理论依据",
  raw: "原始的；未经修饰的",
  reason: "推理；合乎逻辑地思考",
  recall: "回忆；记起能力",
  recognition: "识别；认出",
  recognize: "认出；识别",
  reconstruct: "重建；重新想象",
  recursive: "递归的；反复自指的",
  redraft: "重写稿；再修改版本",
  refine: "改进；精修",
  refinement: "精修；完善",
  reflection: "反射；倒影；反思",
  reflective: "反光的；沉思的",
  refraction: "折射",
  refute: "反驳；证明错误",
  register: "记录；注意到",
  rehearse: "排练；反复练习",
  relate: "关联；说明联系",
  relevance: "相关性；切题程度",
  remnant: "残余；遗留部分",
  remote: "遥远的；疏离的",
  repetition: "重复；反复出现",
  represent: "代表；表现；描绘",
  residue: "残留物；余痕",
  resilient: "有韧性的；能恢复的",
  resistance: "阻力；抵抗",
  resolution: "分辨率；清晰度；解决",
  resolve: "解决；使清楚",
  resonant: "有共鸣的；意味深长的",
  respond: "回应；反应",
  restless: "不安的；停不下来的",
  restrained: "克制的；不过度的",
  restraint: "克制；节制；简约控制",
  retain: "保留；记住",
  retention: "保持；记忆留存",
  retrieve: "提取；找回记忆",
  reveal: "揭示；显现",
  reverent: "虔敬的；深怀敬意的",
  revise: "修改；修订",
  rhythm: "节奏；律动",
  rigid: "僵硬的；固定不变的",
  ritual: "仪式；有意义的重复动作",
  rotation: "旋转；轮换",
  route: "路线；路径",
  routine: "常规；固定程序",
  saturated: "饱和的；色彩浓烈的",
  saturation: "饱和度；色彩强度",
  scaffold: "脚手架；支撑框架",
  scale: "尺度；比例",
  schema: "图式；认知框架",
  screen: "屏幕；遮挡面",
  scrutinize: "细察；仔细审视",
  seam: "接缝；连接线",
  segment: "片段；部分",
  semantics: "语义学；词义研究",
  sequence: "序列；顺序排列",
  sequential: "连续的；按顺序的",
  serene: "宁静的；安详的",
  series: "系列；一组连续事物",
  severe: "严厉的；严重的",
  shade: "阴影；深浅色度",
  shadowplay: "光影变化；影戏般的光影",
  shutter: "快门",
  signify: "表示；象征",
  silence: "寂静；无声",
  silhouette: "剪影；轮廓影像",
  sincere: "真诚的；诚恳的",
  solemn: "庄重的；严肃正式的",
  solitary: "孤独的；独自存在的",
  somber: "阴郁的；严肃暗沉的",
  specify: "具体说明；明确指出",
  specimen: "样本；研究实例",
  spectrum: "光谱；范围",
  spiral: "螺旋；盘旋线",
  stable: "稳定的；不易变化的",
  stamina: "耐力；持久力",
  stance: "立场；态度",
  stark: "鲜明严酷的；简洁强烈的",
  startled: "受惊的；突然惊讶的",
  steadiness: "稳定；沉着",
  stoic: "坚忍的；不动声色的",
  strategy: "策略；计划",
  stratum: "层；地层；阶层",
  stream: "流；连续流动",
  structure: "结构；组成方式",
  subjective: "主观的；基于个人感受的",
  substrate: "底层；基底",
  subtle: "微妙的；不易察觉的",
  summarize: "总结；概括",
  support: "支持；提供证据",
  surface: "表面；可见层",
  survey: "概览；系统调查",
  sway: "摇摆；左右摆动",
  symbolic: "象征性的",
  symmetry: "对称；均衡相似",
  syntax: "句法；结构规则",
  synthesis: "综合；融合形成整体",
  synthesize: "综合；合成新观点",
  tactile: "触觉的；有质感的",
  taxonomy: "分类法；分类系统",
  technique: "技巧；方法",
  tempo: "速度；节奏快慢",
  tender: "温柔的；柔软关怀的",
  tense: "紧张的；绷紧的",
  tension: "张力；紧张感",
  texture: "质感；纹理",
  theme: "主题；中心思想",
  thesis: "论题；中心主张",
  threshold: "门槛；临界点",
  tilt: "倾斜；斜角",
  tint: "淡色；轻微色调",
  trace: "追踪；描摹发展路径",
  trajectory: "轨迹；发展路径",
  tranquil: "平静的；安宁的",
  transform: "转化；改变形态",
  transient: "短暂的；临时的",
  transition: "过渡；转变",
  translate: "翻译；转化表达",
  transparent: "透明的；清楚的",
  uncanny: "诡异的；令人不安的奇怪",
  uneasy: "不安的；略感担忧的",
  validity: "有效性；真实性",
  variation: "变化；变体",
  vast: "辽阔的；巨大的",
  velocity: "速度；方向性速度",
  verdant: "翠绿的；草木繁盛的",
  verify: "核实；验证",
  version: "版本；形式",
  vertical: "垂直的；纵向的",
  vibrant: "充满活力的；色彩鲜明的",
  viewpoint: "观点；观看角度",
  vignette: "小场景；暗角",
  vivid: "生动的；鲜明的",
  void: "空隙；空白",
  volatile: "易变的；不稳定的",
  volume: "体积；空间量",
  vulnerable: "脆弱的；易受伤害的",
  weathered: "风化的；饱经岁月的",
  whimsical: "异想天开的；俏皮奇特的",
  window: "窗；观看入口",
  wistful: "惆怅怀念的",
};

const wordMap = Object.fromEntries(wordBank.map((entry) => [entry.word, entry]));
const glossary = Object.fromEntries(wordBank.map((entry) => [entry.word, entry.definition]));
const chineseGlossary: Record<string, string> = Object.fromEntries(
  wordBank.map((entry) => [
    entry.word,
    trialChineseGlossary[entry.word]
      ?? coreChineseGlossary[entry.word]
      ?? entry.cn
      ?? `试译待精修：${entry.definition}`,
  ]),
);
const coreIpaGlossary: Record<string, string> = {};
const explicitLevelGlossary: Record<string, WordLevel> = Object.fromEntries(
  wordBank.filter((entry) => entry.level).map((entry) => [entry.word, entry.level as WordLevel]),
) as Record<string, WordLevel>;

const cet4WordSet = new Set([
  "absence", "accumulate", "adapt", "adjacent", "arrange", "attention", "awareness", "background", "balance", "blur",
  "candid", "channel", "chart", "classify", "collection", "compare", "composition", "contrast", "current", "define",
  "dynamic", "echo", "explain", "exposure", "exterior", "fabric", "feedback", "focus", "frame", "gallery",
  "gesture", "grain", "gravity", "highlight", "horizon", "horizontal", "index", "interior", "interpret", "layer",
  "literal", "margin", "map", "memorize", "minimal", "notice", "observe", "opening", "organize", "outline",
  "parallel", "passage", "patience", "pattern", "permanent", "perspective", "portal", "practice", "pulse", "reason",
  "recognize", "reflection", "relate", "repetition", "represent", "retain", "retrieve", "rhythm", "scale", "segment",
  "shadow", "silence", "solitary", "stable", "structure", "support", "texture", "transition", "translate", "vertical",
  "vivid", "void", "wave",
]);

const cet6WordSet = new Set([
  "abstract", "adaptive", "ambiguity", "ambiguous", "analytical", "archetype", "articulate", "association", "assured", "atmospheric",
  "attunement", "austere", "benchmark", "capricious", "coherent", "cohesion", "cohesive", "competence", "compressed", "contemplative",
  "contextual", "continuity", "correlation", "criterion", "critique", "deliberate", "demonstrate", "discern", "discernment", "discourse",
  "dissonant", "distinguish", "distortion", "dormant", "elaborate", "elusive", "emergent", "emphasis", "ephemeral", "equilibrium",
  "evaluate", "evoke", "expansive", "figurative", "fluency", "fragile", "fragmented", "harmonious", "hypothesis", "illustrate",
  "immersed", "immersive", "implication", "indicate", "infer", "investigate", "intuitive", "kinetic", "luminous", "meditative",
  "meticulous", "motif", "nuance", "objective", "oblique", "opaque", "perceive", "perception", "peripheral", "poised",
  "precision", "precise", "pristine", "rationale", "relevance", "resilient", "resonant", "restrained", "restraint", "revise",
  "schema", "sequential", "stark", "subjective", "subtle", "symbolic", "synthesize", "tactile", "threshold", "tranquil",
  "transient", "validity", "variation", "volatile", "vulnerable", "weathered",
]);

const visualWordSet = new Set([
  "aperture", "asymmetry", "chiaroscuro", "contour", "foreground", "halftone", "hue", "incandescent", "interplay", "iridescent",
  "juxtapose", "monochrome", "montage", "palette", "panorama", "portraiture", "saturation", "shade", "shutter", "silhouette",
  "spectrum", "symmetry", "tint", "vignette",
]);

function getWordLevel(word: string): WordLevel {
  const lower = word.toLowerCase();
  if (explicitLevelGlossary[word]) return explicitLevelGlossary[word];
  if (explicitLevelGlossary[lower]) return explicitLevelGlossary[lower];
  if (visualWordSet.has(lower)) return "Visual";
  if (cet4WordSet.has(lower)) return "CET-4";
  if (cet6WordSet.has(lower)) return "CET-6";
  if (lower.length <= 7) return "CET-4";
  if (lower.length <= 11) return "CET-6";
  return "Advanced";
}

function getLevelClassName(word: string) {
  const level = getWordLevel(word);
  return `level-tag level-${level.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const wordLevelGlossary: Record<string, WordLevel> = Object.fromEntries(
  wordBank.map((entry) => [entry.word, entry.level ?? getWordLevel(entry.word)]),
) as Record<string, WordLevel>;

const levelSummary = wordBank.reduce<Record<WordLevel, number>>((summary, entry) => {
  summary[wordLevelGlossary[entry.word]] += 1;
  return summary;
}, { "CET-4": 0, "CET-6": 0, Contest: 0, Visual: 0, Advanced: 0 });

function makeQuickIpa(word: string) {
  const lower = word.toLowerCase();
  const suffixRules: Array<[RegExp, string]> = [
    [/tion$/u, "ʃən"],
    [/sion$/u, "ʒən"],
    [/cian$/u, "ʃən"],
    [/ture$/u, "tʃə"],
    [/sure$/u, "ʒə"],
    [/ous$/u, "əs"],
    [/ious$/u, "iəs"],
    [/ive$/u, "ɪv"],
    [/ity$/u, "ɪti"],
    [/ment$/u, "mənt"],
    [/ness$/u, "nəs"],
    [/able$/u, "əbəl"],
    [/ible$/u, "ɪbəl"],
    [/ally$/u, "əli"],
    [/ical$/u, "ɪkəl"],
    [/al$/u, "əl"],
    [/ary$/u, "əri"],
    [/ory$/u, "əri"],
    [/ence$/u, "əns"],
    [/ance$/u, "əns"],
    [/ent$/u, "ənt"],
    [/ant$/u, "ənt"],
    [/ate$/u, "eɪt"],
    [/ize$/u, "aɪz"],
    [/ise$/u, "aɪz"],
    [/ify$/u, "ɪfaɪ"],
    [/ly$/u, "li"],
    [/ed$/u, "d"],
    [/ing$/u, "ɪŋ"],
    [/er$/u, "ə"],
  ];

  let body = lower;
  let suffix = "";
  for (const [pattern, ipa] of suffixRules) {
    if (pattern.test(body)) {
      body = body.replace(pattern, "");
      suffix = ipa;
      break;
    }
  }

  let guide = body
    .replace(/eau/gu, "əʊ")
    .replace(/augh|ough/gu, "ɔː")
    .replace(/tion/gu, "ʃən")
    .replace(/sion/gu, "ʒən")
    .replace(/cial/gu, "ʃəl")
    .replace(/tial/gu, "ʃəl")
    .replace(/ph/gu, "f")
    .replace(/ch/gu, "tʃ")
    .replace(/sh/gu, "ʃ")
    .replace(/th/gu, "θ")
    .replace(/qu/gu, "kw")
    .replace(/x/gu, "ks")
    .replace(/ck/gu, "k")
    .replace(/dge/gu, "dʒ")
    .replace(/ge(?=[aeiou])/gu, "dʒ")
    .replace(/g(?=e|i|y)/gu, "dʒ")
    .replace(/c(?=e|i|y)/gu, "s")
    .replace(/c/gu, "k")
    .replace(/oo/gu, "uː")
    .replace(/ee/gu, "iː")
    .replace(/ea/gu, "iː")
    .replace(/ai|ay/gu, "eɪ")
    .replace(/oa|ow/gu, "əʊ")
    .replace(/ou/gu, "aʊ")
    .replace(/oi|oy/gu, "ɔɪ")
    .replace(/igh/gu, "aɪ")
    .replace(/air/gu, "eə")
    .replace(/ear/gu, "ɪə")
    .replace(/er$/u, "ə")
    .replace(/ar/gu, "ɑː")
    .replace(/or/gu, "ɔː")
    .replace(/ur|ir/gu, "ɜː")
    .replace(/a/gu, "æ")
    .replace(/e/gu, "e")
    .replace(/i/gu, "ɪ")
    .replace(/o/gu, "ɒ")
    .replace(/u/gu, "ʌ")
    .replace(/y/gu, "i");

  guide = (guide + suffix)
    .replace(/([æeɪɒʌiɑɔəɜ][ː]?)(?=[bcdfghjklmnpqrstvwxzθʃʒ]{1,2}[æeɪɒʌiɑɔəɜ])/u, "ˈ$1")
    .replace(/ˈ+/gu, "ˈ")
    .replace(/^ˈ|ˈ$/gu, "");

  return `/${guide}/`;
}

const standardIpaGlossary: Record<string, string> = Object.fromEntries([
  ["austere", "/ɔːˈstɪə/"],
  ["ornate", "/ɔːˈneɪt/"],
  ["capricious", "/kəˈprɪʃəs/"],
  ["ephemeral", "/ɪˈfemərəl/"],
  ["permanent", "/ˈpɜːmənənt/"],
  ["rigid", "/ˈrɪdʒɪd/"],
  ["interplay", "/ˈɪntəpleɪ/"],
  ["absence", "/ˈæbsəns/"],
  ["silence", "/ˈsaɪləns/"],
  ["juxtapose", "/ˌdʒʌkstəˈpəʊz/"],
  ["transient", "/ˈtrænziənt/"],
  ["texture", "/ˈtekstʃə/"],
  ["observe", "/əbˈzɜːv/"],
  ["interpret", "/ɪnˈtɜːprɪt/"],
  ["refine", "/rɪˈfaɪn/"],
  ["luminous", "/ˈluːmɪnəs/"],
  ["monumental", "/ˌmɒnjuˈmentəl/"],
  ["restraint", "/rɪˈstreɪnt/"],
  ["contour", "/ˈkɒntʊə/"],
  ["abstract", "/ˈæbstrækt/"],
  ["ambiguous", "/æmˈbɪɡjuəs/"],
  ["cohesive", "/kəʊˈhiːsɪv/"],
  ["meticulous", "/məˈtɪkjələs/"],
  ["nuance", "/ˈnjuːɑːns/"],
  ["resonant", "/ˈrezənənt/"],
  ["immersive", "/ɪˈmɜːsɪv/"],
  ["tactile", "/ˈtæktaɪl/"],
  ["lucid", "/ˈluːsɪd/"],
  ["subtle", "/ˈsʌtəl/"],
  ["evoke", "/ɪˈvəʊk/"],
  ["iridescent", "/ˌɪrɪˈdesənt/"],
  ["serene", "/səˈriːn/"],
  ["verdant", "/ˈvɜːdənt/"],
  ["solitary", "/ˈsɒlɪtəri/"],
  ["kinetic", "/kɪˈnetɪk/"],
  ["incandescent", "/ˌɪnkænˈdesənt/"],
  ["threshold", "/ˈθreʃhəʊld/"],
  ["intricate", "/ˈɪntrɪkət/"],
  ["vast", "/vɑːst/"],
  ["tranquil", "/ˈtræŋkwɪl/"],
  ["silhouette", "/ˌsɪluˈet/"],
  ["saturated", "/ˈsætʃəreɪtɪd/"],
  ["deliberate", "/dɪˈlɪbərət/"],
  ["fragile", "/ˈfrædʒaɪl/"],
  ["coherent", "/kəʊˈhɪərənt/"],
  ["vivid", "/ˈvɪvɪd/"],
  ["adjacent", "/əˈdʒeɪsənt/"],
  ["dormant", "/ˈdɔːmənt/"],
  ["articulate", "/ɑːˈtɪkjʊlət/"],
  ["discern", "/dɪˈsɜːn/"],
  ["accumulate", "/əˈkjuːmjəleɪt/"],
  ["resilient", "/rɪˈzɪliənt/"],
  ["elusive", "/iˈluːsɪv/"],
  ["candid", "/ˈkændɪd/"],
  ["composed", "/kəmˈpəʊzd/"],
  ["peripheral", "/pəˈrɪfərəl/"],
  ["diffuse", "/dɪˈfjuːs/"],
  ["radiant", "/ˈreɪdiənt/"],
  ["stark", "/stɑːk/"],
  ["granular", "/ˈɡrænjʊlə/"],
  ["poised", "/pɔɪzd/"],
  ["layered", "/ˈleɪəd/"],
  ["dynamic", "/daɪˈnæmɪk/"],
  ["meditative", "/ˈmedɪtətɪv/"],
  ["glacial", "/ˈɡleɪsiəl/"],
  ["arid", "/ˈærɪd/"],
  ["opulent", "/ˈɒpjʊlənt/"],
  ["transparent", "/trænˈspærənt/"],
  ["opaque", "/əʊˈpeɪk/"],
  ["fragmented", "/fræɡˈmentɪd/"],
  ["harmonious", "/hɑːˈməʊniəs/"],
  ["dissonant", "/ˈdɪsənənt/"],
  ["precise", "/prɪˈsaɪs/"],
  ["expansive", "/ɪkˈspænsɪv/"],
  ["compressed", "/kəmˈprest/"],
  ["elaborate", "/ɪˈlæbərət/"],
  ["minimal", "/ˈmɪnɪməl/"],
  ["weathered", "/ˈweðəd/"],
  ["pristine", "/ˈprɪstiːn/"],
  ["oblique", "/əˈbliːk/"],
  ["parallel", "/ˈpærəlel/"],
  ["vertical", "/ˈvɜːtɪkəl/"],
  ["horizontal", "/ˌhɒrɪˈzɒntəl/"],
  ["sequential", "/sɪˈkwenʃəl/"],
  ["recursive", "/rɪˈkɜːsɪv/"],
  ["intuitive", "/ɪnˈtjuːɪtɪv/"],
  ["analytical", "/ˌænəˈlɪtɪkəl/"],
  ["contextual", "/kənˈtekstʃuəl/"],
  ["symbolic", "/sɪmˈbɒlɪk/"],
  ["literal", "/ˈlɪtərəl/"],
  ["figurative", "/ˈfɪɡərətɪv/"],
  ["contemplative", "/kənˈtemplətɪv/"],
  ["volatile", "/ˈvɒlətaɪl/"],
  ["stable", "/ˈsteɪbəl/"],
  ["adaptive", "/əˈdæptɪv/"],
  ["archival", "/ɑːˈkaɪvəl/"],
  ["emergent", "/ɪˈmɜːdʒənt/"],
  ["dimensional", "/daɪˈmenʃənəl/"],
  ["focal", "/ˈfəʊkəl/"],
  ["atmospheric", "/ˌætməsˈferɪk/"],
  ["composition", "/ˌkɒmpəˈzɪʃən/"],
  ["exposure", "/ɪkˈspəʊʒə/"],
  ["contrast", "/ˈkɒntrɑːst/"],
  ["perspective", "/pəˈspektɪv/"],
  ["frame", "/freɪm/"],
  ["aperture", "/ˈæpətʃə/"],
  ["shutter", "/ˈʃʌtə/"],
  ["vignette", "/vɪnˈjet/"],
  ["panorama", "/ˌpænəˈrɑːmə/"],
  ["portraiture", "/ˈpɔːtrɪtʃə/"],
  ["documentary", "/ˌdɒkjuˈmentəri/"],
  ["montage", "/ˈmɒntɑːʒ/"],
  ["foreground", "/ˈfɔːɡraʊnd/"],
  ["background", "/ˈbækɡraʊnd/"],
  ["symmetry", "/ˈsɪmətri/"],
  ["asymmetry", "/eɪˈsɪmətri/"],
  ["monochrome", "/ˈmɒnəkrəʊm/"],
  ["chiaroscuro", "/kiˌɑːrəˈskjʊərəʊ/"],
  ["palette", "/ˈpælət/"],
  ["spectrum", "/ˈspektrəm/"],
  ["focus", "/ˈfəʊkəs/"],
  ["blur", "/blɜː/"],
  ["grain", "/ɡreɪn/"],
  ["resolution", "/ˌrezəˈluːʃən/"]
]);
const phoneticGlossary: Record<string, string> = Object.fromEntries(
  wordBank.map((entry) => [entry.word, standardIpaGlossary[entry.word] ?? coreIpaGlossary[entry.word] ?? makeQuickIpa(entry.word)]),
);

const learningTracks = [
  {
    index: "01",
    name: "Acquire",
    detail: "5 new word studies",
    progress: 72,
    reward: 15,
    questions: [
      makeQuestion("austere", "Choose the word that means severely simple and without ornament.", ["ornate", "capricious"]),
      makeQuestion("juxtapose", "Which word means to place contrasting things together for effect?", ["observe", "refine"]),
      makeQuestion("ephemeral", "A temporary color that disappears quickly is best described as:", ["permanent", "monumental"]),
      makeQuestion("luminous", "Which word describes something giving off or reflecting light?", ["rigid", "abstract"]),
      makeQuestion("contour", "The visible outline of a hill, face, or object is its:", ["absence", "silence"]),
      makeQuestion("meticulous", "A careful learner who notices every detail is:", ["ambiguous", "transient"]),
      makeQuestion("nuance", "A subtle difference in feeling or meaning is a:", ["texture", "permanent"]),
      makeQuestion("lucid", "A clear, easy-to-understand explanation is:", ["ornate", "rigid"]),
    ],
  },
  {
    index: "02",
    name: "Revisit",
    detail: "5 memory checks",
    progress: 46,
    reward: 30,
    questions: [
      makeQuestion("permanent", "Which word means lasting or intended to last forever?", ["transient", "ephemeral"]),
      makeQuestion("texture", "If a surface has a rough visual feel, you are noticing its:", ["absence", "restraint"]),
      makeQuestion("rigid", "Which word means stiff, fixed, and difficult to change?", ["luminous", "capricious"]),
      makeQuestion("restraint", "A design with controlled simplicity shows:", ["ornate", "silence"]),
      makeQuestion("capricious", "Which word means changing suddenly and unpredictably?", ["austere", "monumental"]),
      makeQuestion("cohesive", "A set of ideas that works as one whole is:", ["ambiguous", "subtle"]),
      makeQuestion("tactile", "Which word suggests the feeling of touch or surface?", ["lucid", "absence"]),
      makeQuestion("transient", "Which word means temporary and passing quickly?", ["permanent", "resonant"]),
    ],
  },
  {
    index: "03",
    name: "Interpret",
    detail: "5 visual reading prompts",
    progress: 18,
    reward: 45,
    questions: [
      makeQuestion("interplay", "Complete the idea: the ___ of light and shadow shapes the image.", ["absence", "silence"]),
      makeQuestion("observe", "To watch an image carefully in order to learn from it is to:", ["juxtapose", "refine"]),
      makeQuestion("interpret", "When you explain what a visual detail means, you:", ["contour", "ornate"]),
      makeQuestion("monumental", "A very large and impressive structure can feel:", ["transient", "rigid"]),
      makeQuestion("abstract", "Art that avoids literal realism can be described as:", ["permanent", "luminous"]),
      makeQuestion("resonant", "Which word means deeply meaningful or emotionally powerful?", ["tactile", "lucid"]),
      makeQuestion("immersive", "A scene that fully absorbs your attention is:", ["subtle", "rigid"]),
      makeQuestion("evoke", "To bring a feeling or memory into the mind is to:", ["observe", "refine"]),
    ],
  },
];

type Track = (typeof learningTracks)[number];

const STORAGE_KEY = "wordoria-study-state-v2";

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function sampleWeighted<T>(items: T[], count: number, getWeight: (item: T) => number) {
  const pool = [...items];
  const selected: T[] = [];

  while (pool.length && selected.length < count) {
    const weights = pool.map((item) => Math.max(0.1, getWeight(item)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = Math.random() * total;
    let index = 0;

    for (; index < pool.length; index += 1) {
      cursor -= weights[index];
      if (cursor <= 0) break;
    }

    selected.push(pool.splice(Math.min(index, pool.length - 1), 1)[0]);
  }

  return selected;
}

function getWordWeight(word: string, records: Record<string, WordRecord>) {
  const record = records[word];
  if (!record) return 4.2;

  const accuracy = record.correct / Math.max(record.seen, 1);
  const reviewBoost = record.missed * 3.6;
  const masteryPenalty = record.correct >= 3 && accuracy > 0.72 ? 3.1 : 0;
  const freshnessBoost = record.seen <= 1 ? 1.4 : 0;

  return Math.max(0.35, 1.2 + reviewBoost + freshnessBoost - record.correct * 0.6 - masteryPenalty);
}

function getExamPriorityWeight(word: string) {
  const level = wordLevelGlossary[word] ?? getWordLevel(word);
  if (level === "CET-4") return 2.8;
  if (level === "CET-6") return 3.1;
  if (level === "Contest") return 2.35;
  if (level === "Visual") return 0.55;
  return 0.8;
}

function pickDistractors(correct: string, count = 2) {
  const entry = wordMap[correct];
  const samePart = shuffleArray(wordBank.filter((item) => item.word !== correct && item.part === entry?.part));
  const fallback = shuffleArray(wordBank.filter((item) => item.word !== correct && item.part !== entry?.part));
  return [...samePart, ...fallback].slice(0, count).map((item) => item.word);
}

function makeQuestion(correct: string, prompt: string, distractors: string[]): Question {
  return { prompt, correct, options: shuffleArray([correct, ...distractors]) };
}

function makeReviewQuestion(word: string): Question {
  const entry = wordMap[word];
  return {
    correct: word,
    prompt: `Review miss: which word means "${entry?.definition ?? glossary[word]}"?`,
    options: shuffleArray([word, ...pickDistractors(word)]),
  };
}

function makeDefinitionQuestion(word: string): Question {
  const entry = wordMap[word];

  return {
    correct: word,
    prompt: `Which word means "${entry.definition}"?`,
    options: shuffleArray([word, ...pickDistractors(word)]),
  };
}

function uniqueQuestions(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    if (seen.has(question.correct)) return false;
    seen.add(question.correct);
    return true;
  });
}

function buildQueue(track: Track, records: Record<string, WordRecord>) {
  const trackNumber = Math.max(0, Number(track.index) - 1);
  const reviewWords = sampleWeighted(
    Object.entries(records).filter(([word, record]) => Boolean(wordMap[word]) && record.missed > 0 && record.missed >= record.correct - 1),
    2,
    ([word, record]) => getWordWeight(word, records) + record.missed * 3,
  ).map(([word]) => word);

  const chosen = new Set(reviewWords);
  const freshWords = sampleWeighted(
    wordBank.filter((entry, index) => index % learningTracks.length === trackNumber && !chosen.has(entry.word)),
    5 - reviewWords.length,
    (entry) => getWordWeight(entry.word, records) * getExamPriorityWeight(entry.word),
  ).map((entry) => entry.word);

  return uniqueQuestions(shuffleArray([
    ...reviewWords.map((word) => makeReviewQuestion(word)),
    ...freshWords.map((word) => makeDefinitionQuestion(word)),
  ])).slice(0, 5);
}

function HeroLiquidField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let animation = 0;
    const pointer = { x: 0.58, y: 0.68, tx: 0.58, ty: 0.68 };
    const colors = ["#ff7658", "#8d6cff", "#47d7c8", "#f7ff6a", "#ff8fbf", "#60a7ff"];
    const flows = [
      { angle: 0, shift: 0.62, alpha: 0.26, speed: 0.9 },
      { angle: Math.PI, shift: 0.34, alpha: 0.2, speed: 0.62 },
      { angle: Math.PI / 2, shift: 0.48, alpha: 0.18, speed: 0.76 },
      { angle: -Math.PI / 2, shift: 0.54, alpha: 0.16, speed: 0.58 },
      { angle: 0.68, shift: 0.42, alpha: 0.18, speed: 0.7 },
      { angle: -0.82, shift: 0.68, alpha: 0.15, speed: 0.84 },
    ];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onPointerMove = (event: globalThis.PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      pointer.ty = (event.clientY - bounds.top) / Math.max(bounds.height, 1);
    };

    const drawFlow = (flow: (typeof flows)[number], index: number, time: number) => {
      const span = Math.max(width, height) * 1.7;
      const band = Math.min(width, height) * (0.22 + index * 0.018);
      const drift = Math.sin(time * flow.speed + index) * 120;
      const pointerPull = (pointer.x - 0.5) * 180 + (pointer.y - 0.5) * 120;

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(flow.angle);
      context.translate(-span / 2 + drift + pointerPull, (flow.shift - 0.5) * height * 1.35);

      const gradient = context.createLinearGradient(0, -band, span, band);
      gradient.addColorStop(0, colors[index % colors.length]);
      gradient.addColorStop(0.36, colors[(index + 2) % colors.length]);
      gradient.addColorStop(0.72, colors[(index + 4) % colors.length]);
      gradient.addColorStop(1, colors[(index + 1) % colors.length]);

      context.beginPath();
      context.moveTo(0, 0);
      for (let x = 0; x <= span; x += span / 10) {
        const y = Math.sin(x * 0.006 + time * flow.speed + index * 1.6) * band
          + Math.cos(x * 0.003 - time * 0.55 + index) * band * 0.34;
        context.quadraticCurveTo(x + span / 20, y - band * 0.5, x + span / 10, y);
      }
      context.lineTo(span, band * 1.8);
      for (let x = span; x >= 0; x -= span / 10) {
        const y = Math.sin(x * 0.006 + time * flow.speed + index * 1.6) * band
          + Math.cos(x * 0.003 - time * 0.55 + index) * band * 0.34;
        context.quadraticCurveTo(x - span / 20, y + band * 0.9, x - span / 10, y + band * 1.8);
      }
      context.closePath();
      context.globalAlpha = flow.alpha;
      context.fillStyle = gradient;
      context.fill();
      context.restore();
    };

    const render = () => {
      frame += 1;
      const time = frame * 0.012;
      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#f7f5ef";
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      context.filter = "blur(34px) saturate(1.28)";

      flows.forEach((flow, index) => drawFlow(flow, index, time));

      const wash = context.createRadialGradient(
        pointer.x * width,
        pointer.y * height,
        0,
        pointer.x * width,
        pointer.y * height,
        width * 0.68,
      );
      wash.addColorStop(0, "rgba(255,255,255,.45)");
      wash.addColorStop(0.42, "rgba(247,255,106,.16)");
      wash.addColorStop(1, "rgba(247,245,239,0)");
      context.filter = "blur(18px)";
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);
      context.filter = "none";
      context.globalAlpha = 1;

      animation = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove as unknown as EventListener);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove as unknown as EventListener);
    };
  }, []);

  return <canvas className="hero-liquid" ref={canvasRef} aria-hidden="true" />;
}

export default function Home() {
  const [selected, setSelected] = useState<Photograph | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, WordRecord>>({});
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [studyAnswer, setStudyAnswer] = useState<string | null>(null);
  const [journalPage, setJournalPage] = useState(0);
  const [taskAnswer, setTaskAnswer] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null);
  const [taskStep, setTaskStep] = useState(0);
  const [taskQueue, setTaskQueue] = useState<Question[]>([]);
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const activeTrack = activeTrackIndex === null ? null : learningTracks[activeTrackIndex];
  const activeQuestion = taskQueue[taskStep] ?? null;
  const isTaskComplete = Boolean(activeTrack && taskQueue.length > 0 && taskStep >= taskQueue.length);
  const selectedMeaning = taskAnswer ? glossary[taskAnswer] : null;
  const correctMeaning = activeQuestion ? glossary[activeQuestion.correct] : null;
  const selectedMeaningCn = taskAnswer ? chineseGlossary[taskAnswer] : null;
  const correctMeaningCn = activeQuestion ? chineseGlossary[activeQuestion.correct] : null;
  const selectedMeaningPhonetic = taskAnswer ? phoneticGlossary[taskAnswer] : null;
  const correctMeaningPhonetic = activeQuestion ? phoneticGlossary[activeQuestion.correct] : null;
  const selectedMeaningLevel = taskAnswer ? wordLevelGlossary[taskAnswer] : null;
  const correctMeaningLevel = activeQuestion ? wordLevelGlossary[activeQuestion.correct] : null;
  const recordedWords = useMemo(() => Object.keys(records).sort(), [records]);
  const missedWords = useMemo(() => recordedWords.filter((word) => records[word]?.missed > 0), [recordedWords, records]);
  const savedEntries = useMemo(() => saved.filter((word) => wordMap[word]), [saved]);
  const activeJournal = photographCollections[journalPage] ?? photographCollections[0];
  const journalIssue = String(journalPage + 1).padStart(2, "0");

  const nextTrack = useMemo(() => {
    if (activeTrackIndex === null) return null;
    return learningTracks[(activeTrackIndex + 1) % learningTracks.length];
  }, [activeTrackIndex]);

  const closeAll = () => {
    setSelected(null);
    setMenuOpen(false);
    setActiveTrackIndex(null);
    setArchiveOpen(false);
    setStudyAnswer(null);
    setTaskAnswer(null);
    setTaskStep(0);
    setTaskQueue([]);
    setSessionWords([]);
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as SavedStudyState;
        if (stored.records) setRecords(stored.records);
        if (Array.isArray(stored.saved)) setSaved(stored.saved.filter((word) => wordMap[word]));
        if (Array.isArray(stored.completedTracks)) setCompletedTracks(stored.completedTracks);
        if (typeof stored.xp === "number") setXp(stored.xp);
      }
    } catch {
      // If browser storage is unavailable or corrupted, Wordoria simply starts fresh.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    const payload: SavedStudyState = { records, saved, completedTracks, xp };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Local learning still works even when storage is full or blocked.
    }
  }, [completedTracks, records, saved, storageReady, xp]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const updateScrollZoom = () => {
      const hero = document.querySelector<HTMLElement>(".hero");
      const viewport = Math.max(window.innerHeight, 1);
      const heroRect = hero?.getBoundingClientRect();
      const scrollableHero = Math.max((hero?.offsetHeight ?? viewport * 1.85) - viewport, 1);
      const progress = heroRect ? Math.min(1, Math.max(0, -heroRect.top / scrollableHero)) : Math.min(1, Math.max(0, window.scrollY / Math.max(viewport * 1.35, 1)));
      const cinematic = progress * progress * (3 - 2 * progress);
      const root = document.documentElement;
      root.style.setProperty("--scroll-progress", cinematic.toFixed(3));
      root.style.setProperty("--stage-bg-scale", (1.085 - cinematic * 0.11).toFixed(3));
      root.style.setProperty("--stage-bg-y", `${Math.round(cinematic * -34)}px`);
      root.style.setProperty("--stage-bg-blur", `${(cinematic * 2.2).toFixed(2)}px`);
      root.style.setProperty("--stage-bg-opacity", (1 - cinematic * 0.18).toFixed(3));
      root.style.setProperty("--word-scale", (1 - cinematic * 0.55).toFixed(3));
      root.style.setProperty("--word-lift", `${(cinematic * -7.5).toFixed(2)}vh`);
      root.style.setProperty("--word-opacity", (1 - cinematic * 0.18).toFixed(3));
      root.style.setProperty("--veil-opacity", (cinematic * 0.36).toFixed(3));
      root.style.setProperty("--veil-scale", (0.82 + cinematic * 0.24).toFixed(3));
      root.style.setProperty("--glass-opacity", (cinematic * 0.76).toFixed(3));
      root.style.setProperty("--liquid-compress", (1 - cinematic * 0.18).toFixed(3));
      root.style.setProperty("--practice-scale", (0.9 + cinematic * 0.1).toFixed(3));
      root.style.setProperty("--practice-lift", `${Math.round((1 - cinematic) * 92)}px`);
      root.style.setProperty("--cover-radius", `${Math.round(8 + (1 - cinematic) * 32)}px`);
      root.style.setProperty("--cover-shadow-y", `${Math.round(16 + cinematic * 54)}px`);
      root.style.setProperty("--cover-shadow-blur", `${Math.round(42 + cinematic * 86)}px`);
      root.style.setProperty("--cover-shadow-alpha", (0.1 + cinematic * 0.22).toFixed(3));
      root.style.setProperty("--cover-glow", (0.18 + cinematic * 0.38).toFixed(3));
    };

    updateScrollZoom();
    window.addEventListener("scroll", updateScrollZoom, { passive: true });
    window.addEventListener("resize", updateScrollZoom);
    return () => {
      window.removeEventListener("scroll", updateScrollZoom);
      window.removeEventListener("resize", updateScrollZoom);
    };
  }, []);

  const updateRecord = (word: string, correct: boolean) => {
    setRecords((current) => {
      const existing = current[word] ?? { seen: 0, correct: 0, missed: 0, last: "New" };
      return {
        ...current,
        [word]: {
          seen: existing.seen + 1,
          correct: existing.correct + (correct ? 1 : 0),
          missed: existing.missed + (correct ? 0 : 1),
          last: correct ? "Strengthened" : "Needs review",
        },
      };
    });
  };

  const toggleSave = (word: string) => {
    setSaved((current) => current.includes(word) ? current.filter((item) => item !== word) : [...current, word]);
    if (wordMap[word]) updateRecord(word, true);
  };

  const moveHeroLight = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  };

  const moveWordLight = (event: ReactPointerEvent<HTMLDivElement>) => {
    const word = event.currentTarget;
    const wordBounds = word.getBoundingClientRect();
    word.style.setProperty("--word-x", `${event.clientX - wordBounds.left}px`);
    word.style.setProperty("--word-y", `${event.clientY - wordBounds.top}px`);

    word.querySelectorAll<HTMLElement>(".mega-letter").forEach((letter) => {
      const bounds = letter.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      const dx = localX - bounds.width / 2;
      const dy = localY - bounds.height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const reach = Math.max(bounds.width, bounds.height) * 1.4;
      const heat = Math.max(0, 1 - distance / reach);

      letter.style.setProperty("--lx", `${localX}px`);
      letter.style.setProperty("--ly", `${localY}px`);
      letter.style.setProperty("--heat", heat.toFixed(3));
    });
  };

  const openTrack = (track: Track) => {
    const index = learningTracks.findIndex((item) => item.index === track.index);
    const queue = buildQueue(track, records);
    setActiveTrackIndex(index);
    setTaskQueue(queue);
    setTaskStep(0);
    setTaskAnswer(null);
    setSessionWords([]);
  };

  const answerTask = (option: string) => {
    if (!activeQuestion || taskAnswer) return;
    const isCorrect = option === activeQuestion.correct;
    setTaskAnswer(option);
    updateRecord(activeQuestion.correct, isCorrect);
    if (!isCorrect && wordMap[option]) updateRecord(option, false);
    setSessionWords((current) => Array.from(new Set([...current, activeQuestion.correct, option].filter(Boolean))));
    setXp((current) => current + (isCorrect && activeTrack ? activeTrack.reward : 5));
  };

  const goToNextQuestion = () => {
    if (!activeTrack) return;
    setTaskAnswer(null);
    if (taskStep === taskQueue.length - 1) {
      setCompletedTracks((current) => current.includes(activeTrack.name) ? current : [...current, activeTrack.name]);
    }
    setTaskStep((current) => current + 1);
  };

  const goToNextTrack = () => {
    if (activeTrackIndex === null) return;
    const nextIndex = (activeTrackIndex + 1) % learningTracks.length;
    setActiveTrackIndex(nextIndex);
    setTaskQueue(buildQueue(learningTracks[nextIndex], records));
    setTaskStep(0);
    setTaskAnswer(null);
    setSessionWords([]);
  };

  const turnJournalPage = (direction: number) => {
    setJournalPage((current) => (current + direction + photographCollections.length) % photographCollections.length);
  };

  const getStudyOptions = (photo: Photograph) => {
    const baseIndex = Math.max(0, Number(photo.id) - 1);
    const distractors = wordBank
      .filter((entry) => entry.word !== photo.word)
      .slice(baseIndex + 3, baseIndex + 5)
      .map((entry) => entry.word);

    return [photo.word, ...distractors];
  };

  const openNextStudy = () => {
    if (!selected) return;

    const currentIndex = photographs.findIndex((photo) => photo.id === selected.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % photographs.length;
    const nextPhoto = photographs[nextIndex];
    const nextCollectionIndex = photographCollections.findIndex((collection) => collection.some((photo) => photo.id === nextPhoto.id));

    setSelected(nextPhoto);
    setStudyAnswer(null);
    if (nextCollectionIndex !== -1) setJournalPage(nextCollectionIndex);
  };

  const renderWordCard = (word: string) => {
    const entry = wordMap[word];
    const record = records[word];
    if (!entry) return null;

    return (
      <article className="record-card" key={word}>
        <div>
          <strong>{entry.word}</strong>
          <small>{entry.part} / {record?.last ?? "Saved"}</small>
        </div>
        <em className="record-phonetic">{phoneticGlossary[word]}</em>
        <span className={getLevelClassName(word)}>{wordLevelGlossary[word]}</span>
        <p className="record-cn">{chineseGlossary[word]}</p>
        {entry.definition !== chineseGlossary[word] && <p>{entry.definition}</p>}
        <span>Seen {record?.seen ?? 0} / Missed {record?.missed ?? 0}</span>
      </article>
    );
  };

  return (
    <main>
      <header className="nav-shell">
        <p>Vocabulary is not memorisation.<br />It is a way of seeing.</p>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
          MENU ::
        </button>
      </header>

      <section className="hero" id="top" onPointerMove={moveHeroLight}>
        <div className="hero-stage">
          <HeroLiquidField />
          <a className="hero-cta" href="#practice">BEGIN STUDY <span>-&gt;</span></a>
          <div className="mega-word" aria-label="Wordoria" data-text="WORDORIA" onPointerMove={moveWordLight}>
            {"WORDORIA".split("").map((letter, index) => (
              <span className="mega-letter" data-letter={letter} style={{ "--i": index, "--phase": `${index * 13}%` } as CSSProperties} key={`${letter}-${index}`}>
                {letter}
              </span>
            ))}
          </div>
          <div className="hero-corners">
            <strong>VISUAL LEXICON STUDIO</strong>
            <span>LEXICON / JOURNAL&nbsp;&nbsp;&nbsp;&nbsp; EN</span>
          </div>
        </div>
      </section>

      <section className="marquee" aria-label="Vocabulary themes">
        <div>ARTICULATE / OBSERVE / INTERPRET / REMEMBER / ARTICULATE / OBSERVE / INTERPRET / REMEMBER /</div>
      </section>

      <section className="practice" id="practice">
        <div className="section-intro">
          <p className="overline">YOUR DAILY PRACTICE</p>
          <h2>Precision is<br /><em>a habit.</em></h2>
          <p>Three focused exercises. Wrong answers return until they become familiar.</p>
        </div>
        <div className="task-list">
          {learningTracks.map((task) => (
            <button className="task-row" key={task.index} onClick={() => openTrack(task)}>
              <span>{task.index}</span>
              <strong>{task.name}</strong>
              <small>{task.detail}</small>
              <i><b style={{ width: `${Math.min(100, task.progress + completedTracks.length * 8)}%` }} /></i>
              <em>+{task.reward} XP</em>
              <b className="task-arrow">-&gt;</b>
            </button>
          ))}
        </div>
      </section>

      <section className="journal" id="journal">
        <div className="journal-head">
          <div>
            <p className="overline">THE VISUAL JOURNAL / ISSUE {journalIssue}</p>
            <h2>Read the image.<br />Refine the language.</h2>
          </div>
          <p>Selected photography becomes a mnemonic field: composition, texture, and atmosphere give advanced words somewhere meaningful to live.</p>
        </div>
        <div className="journal-controls" aria-label="Visual journal collections">
          <button onClick={() => turnJournalPage(-1)}>Previous collection</button>
          <span>{journalIssue} / {String(photographCollections.length).padStart(2, "0")}</span>
          <button onClick={() => turnJournalPage(1)}>Next collection</button>
        </div>
        <div className="photo-grid" key={journalPage}>
          {activeJournal.map((photo, index) => (
            <article className={`photo-card photo-${index + 1}`} data-photo-id={photo.id} key={photo.id}>
              <button className="photo-button" onClick={() => { setSelected(photo); setStudyAnswer(null); }} aria-label={`Study ${photo.word}`}>
                <span className="photo-frame"><img src={photo.image} alt={photo.title} /><i>VIEW STUDY -&gt;</i></span>
                <span className="photo-meta"><small>{photo.id} / {photo.category} / {wordLevelGlossary[photo.word]}</small><strong>{photo.title}</strong><em>{photo.word}</em></span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-band">
        <p>"Language becomes memorable when it is attached to a way of seeing."</p>
        <span>WORDORIA / PRINCIPLE 01</span>
      </section>

      <section className="archive" id="archive">
        <div><p className="overline">PERSONAL LEXICON</p><h2>{wordBank.length} words,<br />ready to collect.</h2></div>
        <div className="archive-stats">
          <span><strong>{xp}</strong><small>Practice XP</small></span>
          <span><strong>300</strong><small>CET-4 core</small></span>
          <span><strong>300</strong><small>CET-6 core</small></span>
          <span><strong>100</strong><small>Contest boost</small></span>
          <span><strong>{missedWords.length.toString().padStart(2, "0")}</strong><small>Need review</small></span>
          <span><strong>{saved.length.toString().padStart(2, "0")}</strong><small>Saved words</small></span>
        </div>
        <button className="outline-button" onClick={() => setArchiveOpen(true)}>Open records <span>-&gt;</span></button>
      </section>

      <footer>
        <a className="wordmark light" href="#top">WORDORIA<span>(R)</span></a>
        <p>A visual vocabulary practice<br />for ambitious English learners.</p>
        <div><a href="#practice">Practice</a><a href="#journal">Journal</a><a href="#archive">Lexicon</a></div>
        <small>Photography sourced from Unsplash. (c) 2026 Wordoria.</small>
      </footer>

      {menuOpen && (
        <div className="menu-overlay" role="dialog" aria-modal="true" aria-label="Main menu">
          <button className="modal-close" onClick={closeAll}>CLOSE x</button>
          <p>WORDORIA / NAVIGATION</p>
          <nav>
            <a href="#practice" onClick={closeAll}>Practice <span>01</span></a>
            <a href="#journal" onClick={closeAll}>Visual journal <span>02</span></a>
            <a href="#archive" onClick={closeAll}>Personal lexicon <span>03</span></a>
          </nav>
        </div>
      )}

      {activeTrack && (
        <div className="task-overlay" role="dialog" aria-modal="true" aria-label={`${activeTrack.name} exercise`}>
          <button className="modal-close" onClick={closeAll}>CLOSE x</button>
          <p className="overline">DAILY PRACTICE / {activeTrack.index}</p>
          <h3>{activeTrack.name}</h3>
          <div className="task-progress" aria-label={`${Math.min(taskStep + 1, taskQueue.length)} of ${taskQueue.length}`}>
            <b style={{ width: `${Math.min(taskStep, taskQueue.length) / Math.max(taskQueue.length, 1) * 100}%` }} />
          </div>

          {isTaskComplete ? (
            <div className="task-complete">
              <p className="task-prompt">Ring complete. Your record has been updated. Do you want to enter {nextTrack?.name} next?</p>
              <div className="session-strip">
                {sessionWords.map((word) => <span key={word}>{word}</span>)}
              </div>
              <div className="task-actions">
                <button onClick={goToNextTrack}>Enter {nextTrack?.name}</button>
                <button onClick={() => setArchiveOpen(true)}>View records</button>
                <button onClick={closeAll}>Finish for now</button>
              </div>
            </div>
          ) : activeQuestion ? (
            <>
              <p className="task-count">Question {taskStep + 1} / {taskQueue.length}</p>
              <p className="task-prompt">{activeQuestion.prompt}</p>
              <div className="task-options">
                {activeQuestion.options.map((option) => (
                  <button
                    key={option}
                    className={taskAnswer === option ? (option === activeQuestion.correct ? "correct" : "incorrect") : ""}
                    onClick={() => answerTask(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {taskAnswer && (
                <div className="task-feedback">
                  {taskAnswer === activeQuestion.correct ? (
                    <p><strong>Precisely.</strong> <em>{activeQuestion.correct}</em> <span className="meaning-phonetic">{correctMeaningPhonetic}</span> <span className={getLevelClassName(activeQuestion.correct)}>{correctMeaningLevel}</span> means "{correctMeaning}." <span className="meaning-cn">CN: {correctMeaningCn}</span> +{activeTrack.reward} XP</p>
                  ) : (
                    <p>
                      <strong>Not quite.</strong> You chose <em>{taskAnswer}</em> <span className="meaning-phonetic">{selectedMeaningPhonetic}</span> <span className={getLevelClassName(taskAnswer)}>{selectedMeaningLevel}</span>, which means "{selectedMeaning}". <span className="meaning-cn">CN: {selectedMeaningCn}</span>
                      <br />
                      The correct answer is <em>{activeQuestion.correct}</em> <span className="meaning-phonetic">{correctMeaningPhonetic}</span> <span className={getLevelClassName(activeQuestion.correct)}>{correctMeaningLevel}</span>: "{correctMeaning}". <span className="meaning-cn">CN: {correctMeaningCn}</span>
                      <br />
                      It has been added to review and will return.
                    </p>
                  )}
                  <button onClick={goToNextQuestion}>{taskStep === taskQueue.length - 1 ? "Complete ring" : "Next word"}</button>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {archiveOpen && (
        <div className="lexicon-overlay record-overlay" role="dialog" aria-modal="true" aria-label="Personal lexicon">
          <button className="modal-close" onClick={closeAll}>CLOSE x</button>
          <p className="overline">PERSONAL LEXICON</p>
          <h3>Your recorded words.</h3>
          <div className="record-summary">
            <span><strong>{recordedWords.length}</strong><small>Recorded</small></span>
            <span><strong>{missedWords.length}</strong><small>Review loop</small></span>
            <span><strong>{completedTracks.length}</strong><small>Rings complete</small></span>
          </div>
          <div className="record-columns">
            <section>
              <h4>Needs review</h4>
              {missedWords.length ? missedWords.map(renderWordCard) : <p className="empty-state">No missed words yet.</p>}
            </section>
            <section>
              <h4>Recorded</h4>
              {recordedWords.length ? recordedWords.map(renderWordCard) : <p className="empty-state">Complete a practice ring to record words.</p>}
            </section>
            <section>
              <h4>Saved</h4>
              {savedEntries.length ? savedEntries.map(renderWordCard) : <p className="empty-state">Open a visual study and choose SAVE + to build this shelf.</p>}
            </section>
          </div>
        </div>
      )}

      {selected && (
        <div className="study-overlay" role="dialog" aria-modal="true" aria-label={`Study ${selected.word}`}>
          <button className="modal-close" onClick={closeAll}>CLOSE x</button>
          <div className="study-image"><img src={selected.image} alt={selected.title} /><small>{selected.credit}</small></div>
          <div className="study-copy">
            <p className="overline">VISUAL STUDY / {selected.id}</p>
            <div className="word-title">
              <h3>{selected.word}</h3>
              <button onClick={() => toggleSave(selected.word)} aria-label="Save word">{saved.includes(selected.word) ? "SAVED" : "SAVE +"}</button>
            </div>
            <span className="phonetic">{phoneticGlossary[selected.word]} · {selected.part}</span>
            <span className={getLevelClassName(selected.word)}>{wordLevelGlossary[selected.word]}</span>
            <p className="cn-definition">{chineseGlossary[selected.word]}</p>
            {selected.definition !== chineseGlossary[selected.word] && <p className="definition">{selected.definition}</p>}
            <blockquote>{selected.sentence}</blockquote>
            <div className="challenge">
              <small>CONTEXT CHECK</small>
              <p>Which word best matches this visual study?</p>
              <div>
                {getStudyOptions(selected).map((option) => (
                  <button
                    key={option}
                    className={studyAnswer === option ? (option === selected.word ? "correct" : "incorrect") : ""}
                    onClick={() => {
                      setStudyAnswer(option);
                      updateRecord(selected.word, option === selected.word);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {studyAnswer && (
                <>
                  <em>
                    {studyAnswer === selected.word
                      ? `Precisely. ${selected.word} ${phoneticGlossary[selected.word]} [${wordLevelGlossary[selected.word]}] means "${selected.definition}". CN: ${chineseGlossary[selected.word]}. +25 XP`
                      : `Not quite. ${studyAnswer} ${phoneticGlossary[studyAnswer]} [${wordLevelGlossary[studyAnswer]}] means "${glossary[studyAnswer]}". CN: ${chineseGlossary[studyAnswer]}; ${selected.word} ${phoneticGlossary[selected.word]} [${wordLevelGlossary[selected.word]}] means "${selected.definition}". CN: ${chineseGlossary[selected.word]}.`}
                  </em>
                  <button className="study-next-button" onClick={openNextStudy}>Next visual study -&gt;</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

