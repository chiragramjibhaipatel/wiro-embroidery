import type {
  RunInput,
  FunctionRunResult,
  CartLine,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

function updatePrice(line: CartLine) {
  const { merchandise } = line;
  if (merchandise.__typename !== "ProductVariant") {
    return false;
  }
  const hasEmbroidery = line.hasEmbroidery?.value === "Yes";
  if (!hasEmbroidery) {
    console.error("No embroidery found");
    return false;
  }
  console.error("Embroidery found");
  const { letterColor } = line;
  console.error(letterColor?.value);
  const { product } = merchandise;
  const { embroideryCost } = product;
  if(!embroideryCost){
    console.error("No embroidery cost found");
    return false;
  }
  const embroideryCostParsed = JSON.parse(embroideryCost?.value);
  console.error(embroideryCostParsed[letterColor?.value]);
  let additionalCost = 0;
  if (letterColor && embroideryCostParsed[letterColor.value]) {
    additionalCost = embroideryCostParsed[letterColor.value];
  }
  if(additionalCost === 0){
    console.error("No additional cost found");
    return false;
  }
  return {
    update: {
      cartLineId: line.id,
      price: {
        adjustment: {
          fixedPricePerUnit: {
            amount: parseFloat(line.cost.amountPerQuantity.amount) + additionalCost,
          },
        },
      },
    },
  };
}

export function run(input: RunInput): FunctionRunResult {
  const { cart: { lines } } = input;

  return {
    operations: lines.map(line => updatePrice(line)).filter(Boolean)
  };
};