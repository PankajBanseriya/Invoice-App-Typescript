import { IconButton } from "@mui/material";

interface GridActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
}

const GridActionButton = ({
  icon,
  onClick,
}: GridActionButtonProps) => {
  return (
    <IconButton
      size="small"
      onClick={onClick}
    >
      {icon}
    </IconButton>
  );
};

export default GridActionButton;