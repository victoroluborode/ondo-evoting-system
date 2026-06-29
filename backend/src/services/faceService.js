"use strict";

const path = require("path");
const sharp = require("sharp");

let faceapi = null;

const MODEL_PATH =
  process.env.FACE_MODEL_PATH || path.join(__dirname, "../../models");
const FACE_MATCH_THRESHOLD = parseFloat(
  process.env.FACE_MATCH_THRESHOLD || "0.45",
);

async function getFaceApi() {
  if (faceapi) return faceapi;

  require("@tensorflow/tfjs-node");
  faceapi = require("@vladmandic/face-api");

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);

  return faceapi;
}

async function imageBytesToTensor(imageBytes) {
  const tf = require("@tensorflow/tfjs-node");
  const pngBuffer = await sharp(imageBytes).png().toBuffer();
  return tf.node.decodeImage(pngBuffer, 3);
}

/**
 * Extracts a normalised 128-d face descriptor from raw image bytes.
 * Throws if no face is detected.
 */
async function extractEmbedding(imageBytes) {
  const api = await getFaceApi();
  const tensor = await imageBytesToTensor(imageBytes);

  const detections = await api
    .detectAllFaces(
      tensor,
      new api.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

  tensor.dispose();

  if (!detections || detections.length === 0) {
    throw new Error("No face detected in the submitted image.");
  }

  const best = detections.reduce((prev, curr) => {
    const prevArea = prev.detection.box.width * prev.detection.box.height;
    const currArea = curr.detection.box.width * curr.detection.box.height;
    return currArea > prevArea ? curr : prev;
  });

  return normalise(Array.from(best.descriptor));
}

function compareEmbeddings(
  enrolledEmbedding,
  probeEmbedding,
  threshold = FACE_MATCH_THRESHOLD,
) {
  const dot = dotProduct(enrolledEmbedding, probeEmbedding);
  const denom = norm(enrolledEmbedding) * norm(probeEmbedding);
  const similarity = denom === 0 ? 0 : dot / denom;
  return { similarity, matched: similarity >= threshold };
}

function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function norm(v) {
  return Math.sqrt(dotProduct(v, v));
}

function normalise(v) {
  const n = norm(v);
  if (n === 0) throw new Error("Face embedding could not be normalised.");
  return v.map((x) => x / n);
}

module.exports = { extractEmbedding, compareEmbeddings, FACE_MATCH_THRESHOLD };
