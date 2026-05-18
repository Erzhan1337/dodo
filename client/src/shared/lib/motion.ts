export const loadMotionFeatures = () =>
  import("framer-motion").then((res) => res.domMax);
