import { Button } from "@chakra-ui/react";

interface ButtonStyledProps {
  onClick: () => void;
  text: string;
  width?: string;
  ml?: string;
}
export default function ButtonStyled({
  onClick,
  text,
  width,
  ml,
}: ButtonStyledProps) {
  return (
    <Button
      onClick={onClick}
      bg="#158DE8"
      color="white"
      fontWeight="medium"
      borderRadius="xl"
      border="1px solid transparent"
      ml={ml}
      width={width}
      _hover={{
        borderColor: "blue.700",
        color: "gray.800",
      }}
      _active={{
        backgroundColor: "blue.800",
        borderColor: "blue.700",
      }}
    >
      {text}
    </Button>
  );
}
