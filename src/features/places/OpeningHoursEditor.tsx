import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { DaySchedule, WeekSchedule } from "./openingHours";
import { WEEKDAYS } from "./openingHours";

interface OpeningHoursEditorProps {
  value: WeekSchedule;
  onChange: (next: WeekSchedule) => void;
  disabled?: boolean;
  error?: string | null;
}

/**
 * One row per weekday. A day switched off sends no rows at all, which is exactly how
 * the backend encodes "closed that day". A day may hold several intervals (e.g. a
 * lunch break) — the API keys rows by (weekday, opens_at), so repeats are legal as
 * long as they start at different times.
 */
export function OpeningHoursEditor({ value, onChange, disabled, error }: OpeningHoursEditorProps) {
  const patchDay = (weekday: number, patch: Partial<DaySchedule>) => {
    onChange({ ...value, [weekday]: { ...value[weekday], ...patch } });
  };

  const patchInterval = (weekday: number, index: number, field: "opens_at" | "closes_at", next: string) => {
    const intervals = value[weekday].intervals.map((interval, i) =>
      i === index ? { ...interval, [field]: next } : interval,
    );
    patchDay(weekday, { intervals });
  };

  const addInterval = (weekday: number) => {
    patchDay(weekday, { intervals: [...value[weekday].intervals, { opens_at: "", closes_at: "" }] });
  };

  const removeInterval = (weekday: number, index: number) => {
    patchDay(weekday, { intervals: value[weekday].intervals.filter((_, i) => i !== index) });
  };

  const applyMondayToAll = () => {
    const monday = value[1];
    const next: WeekSchedule = { ...value };
    for (const day of WEEKDAYS) {
      next[day.value] = {
        open: monday.open,
        allDay: monday.allDay,
        intervals: monday.intervals.map((interval) => ({ ...interval })),
      };
    }
    onChange(next);
  };

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2">Opening hours</Typography>
        <Button size="small" onClick={applyMondayToAll} disabled={disabled}>
          Copy Monday to all days
        </Button>
      </Stack>

      <Stack spacing={1}>
        {WEEKDAYS.map((day) => {
          const entry = value[day.value];
          return (
            <Stack
              key={day.value}
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <FormControlLabel
                sx={{ width: 140, mr: 0 }}
                control={
                  <Switch
                    size="small"
                    checked={entry.open}
                    disabled={disabled}
                    onChange={(event) => patchDay(day.value, { open: event.target.checked })}
                  />
                }
                label={day.label}
              />

              {!entry.open && (
                <Typography variant="body2" color="text.secondary" sx={{ pt: 1.25 }}>
                  Closed
                </Typography>
              )}

              {entry.open && !entry.allDay && (
                <Stack spacing={1}>
                  {entry.intervals.map((interval, index) => (
                    <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <TextField
                        type="time"
                        size="small"
                        label="From"
                        disabled={disabled}
                        value={interval.opens_at}
                        onChange={(event) => patchInterval(day.value, index, "opens_at", event.target.value)}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 300 } }}
                        sx={{ width: 130 }}
                      />
                      <TextField
                        type="time"
                        size="small"
                        label="To"
                        disabled={disabled}
                        value={interval.closes_at}
                        onChange={(event) => patchInterval(day.value, index, "closes_at", event.target.value)}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 300 } }}
                        sx={{ width: 130 }}
                      />
                      {index === entry.intervals.length - 1 ? (
                        <Tooltip title="Add another interval (e.g. after a break)">
                          <span>
                            <IconButton
                              size="small"
                              disabled={disabled}
                              onClick={() => addInterval(day.value)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Box sx={{ width: 34 }} />
                      )}
                      {entry.intervals.length > 1 && (
                        <IconButton
                          size="small"
                          disabled={disabled}
                          onClick={() => removeInterval(day.value, index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}

              {entry.open && (
                <FormControlLabel
                  sx={{ ml: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={entry.allDay}
                      disabled={disabled}
                      onChange={(event) => patchDay(day.value, { allDay: event.target.checked })}
                    />
                  }
                  label="24 hours"
                />
              )}
            </Stack>
          );
        })}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Venue-local times. A closing time earlier than the opening time means the place closes after midnight.
      </Typography>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
