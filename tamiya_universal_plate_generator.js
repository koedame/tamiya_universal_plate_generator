const { cylinder } = require('@jscad/modeling').primitives;
const { extrudeLinear } = require('@jscad/modeling').extrusions;
const { roundedRectangle } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;
const { translate } = require('@jscad/modeling').transforms;

// Parameter definitions
const getParameterDefinitions = () => [
  { name: 'length', type: 'number', initial: 160, caption: 'Plate length (mm)' },
  { name: 'width', type: 'number', initial: 60, caption: 'Plate width (mm) / Basic=60mm, L=210' },
  { name: 'thickness', type: 'number', initial: 3, caption: 'Plate thickness (mm)' },
  { name: 'cornerRadius', type: 'number', initial: 3, caption: 'Corner radius (mm)' },
  { name: 'margin', type: 'number', initial: 5, caption: 'Distance from plate edge (mm)' },
  { name: 'holeSpacing', type: 'number', initial: 5, caption: 'Hole spacing (mm)' },
  { name: 'holeDiameter', type: 'number', initial: 3, caption: 'Hole diameter (mm)' }
];

function main(params) {
  const { thickness, length, width, margin, cornerRadius, holeSpacing, holeDiameter } = params;

  // Create base plate shape
  const shape2D = roundedRectangle({
    size: [width, length],
    roundRadius: cornerRadius
  });

  // Extrude 2D shape to create 3D plate
  let plate = extrudeLinear({height: thickness}, shape2D);

  // Define hole attributes
  const holeRadius = holeDiameter / 2;

  // Calculate start and end positions for holes
  const startX = -1 * (width / 2 - margin);
  const startY = -1 * (length / 2 - margin);
  const endX = width / 2 - margin;
  const endY = length / 2 - margin;

  // Generate hole positions
  const holePositions = [];
  for (let x = startX; x <= endX; x += holeSpacing) {
    for (let y = startY; y <= endY; y += holeSpacing) {
      holePositions.push([x, y]);
    }
  }

  // Create single hole shape
  const holeShape = cylinder({
    radius: holeRadius,
    height: thickness,
    center: [0, 0, thickness / 2]
  });

  // Create and position all holes
  const holes = holePositions.map(([x, y]) => 
    translate([x, y, 0], holeShape)
  );

  // Subtract holes from plate
  plate = subtract(plate, union(holes));

  return plate;
}

module.exports = { main, getParameterDefinitions };
