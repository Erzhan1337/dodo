const shimmer = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#FFF7EE"/></svg>`;

export const BLUR_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(shimmer).toString("base64")}`;
