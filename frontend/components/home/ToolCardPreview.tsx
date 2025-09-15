import * as React from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
} from "@mui/material";

interface Props {
  title: string;
  description: string;
  image: string;
  link: string;
}

export default function ActionAreaCard({
  title,
  description,
  image,
  link,
}: Props) {
  return (
    <Card sx={{ maxWidth: 275 }}>
      <Link
        href={link}
        passHref
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <CardMedia
            component="img"
            height="160"
            image={image}
            alt={title}
            sx={{ filter: "grayscale(80%)" }}
          />
          <CardContent sx={{ minHeight: "125px" }}>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
