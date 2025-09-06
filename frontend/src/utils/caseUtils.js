// Get the color from the (status/category/priority) color and return (color, background-color, border-color)
// the color will come in this format "--color-blue-200"

export const getColorStyles = (color) => {
  const baseColor = color.split("-")[3] || "grey";
  //   console.log("Base color: ", baseColor);
  return {
    color: `var(--color-${baseColor}-700)`,
    backgroundColor: `var(--color-${baseColor}-100)`,
    borderColor: `var(--color-${baseColor}-200)`,
  };
};
