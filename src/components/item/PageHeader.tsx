import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  rightContent?: React.ReactNode;
}

const PageHeader = ({
  title,
  subtitle,
  rightContent,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 3,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          fontWeight="400"
          mb={0.75}
          fontSize="30px"
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          fontSize={16}
          color="textSecondary"
        >
          {subtitle}
        </Typography>
      </Box>

      {rightContent}
    </Box>
  );
};

export default PageHeader;