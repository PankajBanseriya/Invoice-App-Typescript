import type { ChangeEvent } from "react";

import {
  OutlinedInput,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

interface SearchInputProps {
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement>,
  ) => void;
  placeholder?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder,
}: SearchInputProps) => {
  return (
    <OutlinedInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="medium"
      sx={{
        height: "40px",
        mr: "10px",
        flex: 0.5,
      }}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      }
    />
  );
};

export default SearchInput;