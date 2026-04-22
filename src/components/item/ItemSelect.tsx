import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useItems } from '../../hooks/useItems';
import type { Item } from '../../hooks/useItems';

interface ItemSelectProps {
  value: Item | null;
  onChange: (event: React.SyntheticEvent, value: Item | null) => void;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
}

const ItemSelect: React.FC<ItemSelectProps> = ({ 
  value, 
  onChange, 
  error, 
  helperText, 
  size = "small" 
}) => {
  const { items, isLoading } = useItems();

  return (
    <Autocomplete<Item>
      size={size}
      options={items}
      loading={isLoading}
      getOptionLabel={(option) => option.itemName || ""}
      isOptionEqualToValue={(option, val) => option.itemID === val?.itemID}
      value={value} 
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select item..."
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? null : null} 
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default ItemSelect;