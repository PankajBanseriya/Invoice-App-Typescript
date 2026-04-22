import React from "react";
import { Avatar } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

export const imageCache: Record<string | number, string> = {};

interface ItemImageProps {
  itemID: number | string;
}

const ItemImage: React.FC<ItemImageProps> = ({ itemID }) => {
  const { data: imgSrc } = useQuery<string | null>({
    queryKey: ["itemPicture", itemID],
    queryFn: async () => {
      if (imageCache[itemID]) return imageCache[itemID];

      const response = await api.get<string>(`/Item/Picture/${itemID}?t=${Date.now()}`);
      
      if (response.data && typeof response.data === 'string') {
        const cleanUrl = response.data.replace(/^"|"$/g, '');
        
        imageCache[itemID] = cleanUrl;
        return cleanUrl;
      }
      return null;
    },
    enabled: !!itemID, 
    staleTime: 0,
  });

  return (
    <Avatar
      src={imgSrc ?? undefined}
      variant="rounded"
      sx={{ 
        width: 45, 
        height: 45, 
        borderRadius: "5px",
        bgcolor: "#eee",
      }}
    >
      <ImageIcon sx={{ fontSize: "20px", color: "#bdbdbd" }} />
    </Avatar>
  );
};

export default React.memo(ItemImage);