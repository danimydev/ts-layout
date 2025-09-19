import "./style.css";
import Example from "./example";

const canvasElement = document.getElementsByTagName("canvas").item(0);

if (!canvasElement) {
  throw new Error("could not find any canvas element");
}

document.body.appendChild(canvasElement);

canvasElement.width = 775;
canvasElement.height = 600;

const context = canvasElement.getContext("2d");

if (!context) {
  throw new Error("2d context not supported.");
}

Example(context);
