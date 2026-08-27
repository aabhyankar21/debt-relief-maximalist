/**
 * Wireframe hand plate. The hand, cluster, and vertical rays share one
 * slot so the group can be sized without cropping the mesh or the load.
 */

import handSrc from './hand.png';
import { UNBURDEN_CONFIG } from './config';

export interface SceneLayout {
  width: number;
  height: number;
  formRight: number;
  palmX: number;
  palmY: number;
  clusterR: number;
  imgX: number;
  imgY: number;
  imgW: number;
  imgH: number;
  beamTop: number;
}

/** Source still, and the palm cup inside it. */
const HAND = {
  width: 1024,
  height: 497,
  palmX: 0.37,
  palmY: 0.7,
  meshLeft: 0.007,
  meshTop: 0.02,
  meshRight: 0.991,
  meshBottom: 0.986,
} as const;

/** Drawn width matched to the previous plate on desktop. */
const HAND_TARGET_W = 422;

const GROUP_PAD = 16;

export const HAND_FLOAT_PX = 4;

let handImage: HTMLImageElement | null = null;
let handLoad: Promise<HTMLImageElement> | null = null;

export function loadHandImage(): Promise<HTMLImageElement> {
  if (handImage) return Promise.resolve(handImage);
  if (handLoad) return handLoad;
  handLoad = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      handImage = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error('Hand plate failed to load'));
    img.src = handSrc;
  });
  return handLoad;
}

export function layoutScene(
  width: number,
  height: number,
  holdR: number,
): SceneLayout {
  const aspect = HAND.width / HAND.height;
  const hover = UNBURDEN_CONFIG.clusterHover;
  const pad = Math.min(GROUP_PAD, Math.max(8, Math.min(width, height) * 0.04));
  const innerW = Math.max(64, width - pad * 2);
  const innerH = Math.max(64, height - pad * 2);

  let imgW = Math.min(HAND_TARGET_W, innerW);
  let imgH = imgW / aspect;
  if (imgH > innerH * 0.72) {
    imgH = innerH * 0.72;
    imgW = imgH * aspect;
  }

  let clusterR = Math.min(width, height) * 0.26 * (holdR / 0.4);

  const palmFromTop = HAND.palmY * imgH;
  const palmFromBottom = (HAND.meshBottom - HAND.palmY) * imgH;
  const palmFromLeft = (HAND.palmX - HAND.meshLeft) * imgW;
  const palmFromRight = (HAND.meshRight - HAND.palmX) * imgW;

  const maxRHeight =
    (innerH - palmFromBottom - HAND_FLOAT_PX * 2 - 8) / (hover + 1);
  const maxRWidth = Math.min(palmFromLeft, palmFromRight, innerW * 0.42);
  clusterR = Math.max(12, Math.min(clusterR, maxRHeight, maxRWidth));

  const clusterAbove = clusterR * (hover + 1) + HAND_FLOAT_PX;
  const groupH = Math.max(clusterAbove, palmFromTop + HAND_FLOAT_PX) + palmFromBottom;
  const groupW = Math.max(clusterR * 1.08, palmFromLeft) + Math.max(clusterR * 1.08, palmFromRight);

  const extraY = Math.max(0, innerH - groupH);
  const extraX = Math.max(0, innerW - groupW);
  const compact = height < 420;

  /* Pin the forearm toward the right edge; sit the mesh on the lower half
     so the rays have a clear run from the top of the slot. On the stacked
     mobile slot, pin to the bottom so the form sheet can overlap the hand. */
  const palmX =
    pad + Math.max(clusterR * 1.08, palmFromLeft) + extraX * 0.72;
  const palmY =
    pad +
    Math.max(clusterAbove, palmFromTop + HAND_FLOAT_PX) +
    extraY * (compact ? 1 : 0.82);

  const imgX = palmX - HAND.palmX * imgW;
  const imgY = palmY - HAND.palmY * imgH;

  return {
    width,
    height,
    formRight: 0,
    palmX,
    palmY,
    clusterR,
    imgX,
    imgY,
    imgW,
    imgH,
    beamTop: pad * 0.4,
  };
}

export function handFloat(time: number, reduce: boolean) {
  if (reduce) return 0;
  return Math.sin(time * 1.15) * HAND_FLOAT_PX;
}

export function drawHand(
  ctx: CanvasRenderingContext2D,
  layout: SceneLayout,
  image: HTMLImageElement | null,
  floatY: number,
) {
  if (!image) return;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    layout.imgX,
    layout.imgY + floatY,
    layout.imgW,
    layout.imgH,
  );
  ctx.restore();
}
