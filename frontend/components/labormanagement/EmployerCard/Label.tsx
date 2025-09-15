import { Box, Typography } from "@mui/material";

export default function Label({
  color,
  text,
  count,
  output,
  worker,
}: {
  color: string;
  text: string;
  count: number;
  output?: string;
  worker: boolean;
}) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
      <Typography variant="caption" color="text.primary" fontSize=".8rem">
        {text}: {count}
        {worker && count > 0 && ` ${count === 1 ? "worker" : "workers"}`}
      </Typography>
      {output && (
        <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
          {output}
        </Typography>
      )}
    </Box>
  );
}
