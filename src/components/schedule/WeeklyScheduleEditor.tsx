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
import type { DaySchedule, Interval, WeekSchedule } from "../../lib/weeklySchedule";
import { WEEKDAYS } from "../../lib/weeklySchedule";

interface WeeklyScheduleEditorProps {
  value: WeekSchedule;
  onChange: (next: WeekSchedule) => void;
  /** Heading above the grid, e.g. "Opening hours". Omit when the caller renders its own. */
  title?: string;
  /** What a switched-off day means here, e.g. "Closed" or "Not available". */
  offLabel?: string;
  hint?: string;
  disabled?: boolean;
  error?: string | null;
}

/**
 * One row per weekday. A day switched off sends no windows at all. A day may hold
 * several intervals (e.g. a lunch break) — the API keys rows by (weekday, start), so
 * repeats are legal as long as they start at different times. Shared by a place's
 * opening hours and a discount's schedule.
 */
export function WeeklyScheduleEditor({
  value,
  onChange,
  title,
  offLabel = "Выключено",
  hint = "Местное время заведения. Если конец раньше начала, интервал переходит через полночь.",
  disabled,
  error,
}: WeeklyScheduleEditorProps) {
  const patchDay = (weekday: number, patch: Partial<DaySchedule>) => {
    onChange({ ...value, [weekday]: { ...value[weekday], ...patch } });
  };

  const patchInterval = (weekday: number, index: number, field: keyof Interval, next: string) => {
    const intervals = value[weekday].intervals.map((interval, i) =>
      i === index ? { ...interval, [field]: next } : interval,
    );
    patchDay(weekday, { intervals });
  };

  const addInterval = (weekday: number) => {
    patchDay(weekday, { intervals: [...value[weekday].intervals, { start: "", end: "" }] });
  };

  const removeInterval = (weekday: number, index: number) => {
    patchDay(weekday, { intervals: value[weekday].intervals.filter((_, i) => i !== index) });
  };

  const applyMondayToAll = () => {
    const monday = value[1];
    const next: WeekSchedule = { ...value };
    for (const day of WEEKDAYS) {
      next[day.value] = {
        enabled: monday.enabled,
        allDay: monday.allDay,
        intervals: monday.intervals.map((interval) => ({ ...interval })),
      };
    }
    onChange(next);
  };

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Button size="small" onClick={applyMondayToAll} disabled={disabled}>
          Скопировать понедельник на все дни
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
                    checked={entry.enabled}
                    disabled={disabled}
                    onChange={(event) => patchDay(day.value, { enabled: event.target.checked })}
                  />
                }
                label={day.label}
              />

              {!entry.enabled && (
                <Typography variant="body2" color="text.secondary" sx={{ pt: 1.25 }}>
                  {offLabel}
                </Typography>
              )}

              {entry.enabled && !entry.allDay && (
                <Stack spacing={1}>
                  {entry.intervals.map((interval, index) => (
                    <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <TextField
                        type="time"
                        size="small"
                        label="С"
                        disabled={disabled}
                        value={interval.start}
                        onChange={(event) => patchInterval(day.value, index, "start", event.target.value)}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 300 } }}
                        sx={{ width: 130 }}
                      />
                      <TextField
                        type="time"
                        size="small"
                        label="До"
                        disabled={disabled}
                        value={interval.end}
                        onChange={(event) => patchInterval(day.value, index, "end", event.target.value)}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 300 } }}
                        sx={{ width: 130 }}
                      />
                      {index === entry.intervals.length - 1 ? (
                        <Tooltip title="Добавить интервал (например, после перерыва)">
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

              {entry.enabled && (
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
                  label="Круглосуточно"
                />
              )}
            </Stack>
          );
        })}
      </Stack>

      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {hint}
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
