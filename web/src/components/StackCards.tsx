import type { Card } from "@lovepebble/server";
import { type CSSProperties, type ReactElement, useRef } from "react";
import { CharacterCard } from "./CharacterCard.tsx";

function sample<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

interface StackCardsProps {
  cards: Array<Card | null>;
}

export const StackCards = ({ cards }: StackCardsProps): ReactElement => {
  const shiftStylesRef = useRef<Array<CSSProperties>>([]);

  return (
    <>
      {cards.map((c, i) => {
        let shiftStyles = shiftStylesRef.current.at(i);

        if (!shiftStyles) {
          const shiftY = sample(["top", "bottom", undefined] as const);
          const shiftX = sample(["right", "left", undefined] as const);

          const style: CSSProperties = {};
          if (shiftX) style[shiftX] = "3px";
          if (shiftY) style[shiftY] = "3px";

          shiftStyles = style;
          shiftStylesRef.current.push(style);
        }

        return (
          <CharacterCard
            key={`${c}-${i}`}
            position={i > 0 ? "absolute" : undefined}
            character={c}
            boxShadow="-2px -2px 8px 0px rgba(0,0,0,0.3)"
            top="0"
            left="0"
            style={shiftStyles}
          />
        );
      })}
    </>
  );
};
