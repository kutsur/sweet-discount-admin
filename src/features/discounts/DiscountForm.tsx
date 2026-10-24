import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type Control, type FieldErrors } from "react-hook-form";
import { ApiError } from "../../api/envelope";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { ImageField } from "../../components/images/ImageField";
import type { Image } from "../../components/images/api";
import { WeeklyScheduleEditor } from "../../components/schedule/WeeklyScheduleEditor";
import { validationDetail } from "../../lib/formErrors";
import {
  emptyWeekSchedule,
  hasEnabledDay,
  validateWeekSchedule,
  type WeekSchedule,
} from "../../lib/weeklySchedule";
import type { Discount, DiscountKind, ScheduleWindow } from "./api";
import { DISCOUNT_KIND_VALUES, DISCOUNT_KINDS } from "./discountKinds";
import { weekScheduleFromDiscount, weekScheduleToDiscount } from "./discountSchedule";
import { discountFormSchema, emptyDiscountForm, type DiscountFormValues } from "./discountSchema";
import { matchFormField } from "./errorMapping";

/**
 * What the form produces. Create sends it with place_id added; update drops kind (immutable)
 * and status (toggled from the page header instead).
 */
export interface DiscountPayload {
  kind: DiscountKind;
  title: string;
  description: string | null;
  percent_off: number | null;
  status: "active" | "paused";
  starts_on: string | null;
  ends_on: string | null;
  schedule: ScheduleWindow[];
  image_id: string | null;
}

interface DiscountFormProps {
  /** The discount being edited; omit to create. Mount with `key={discount.id}`. */
  discount?: Discount;
  /** Create-only fields rendered above the rest — the place picker. */
  header?: ReactNode;
  submitLabel: string;
  onSubmit: (payload: DiscountPayload) => Promise<unknown>;
  /** Lets the caller route a 422 it owns (place_id) to its own field; return true if handled. */
  onFieldError?: (field: "place_id", message: string) => boolean;
  disabled?: boolean;
}

function valuesFromDiscount(discount: Discount): DiscountFormValues {
  return {
    kind: discount.kind,
    title: discount.title,
    description: discount.description ?? "",
    percent_off: discount.percent_off ?? Number.NaN,
    active: discount.status === "active",
    starts_on: discount.starts_on ?? "",
    ends_on: discount.ends_on ?? "",
  };
}

/**
 * The discount editor, shared by the create and detail pages. The schedule is either
 * "always" (sent as [], all day every day) or a weekly grid; the kind decides which
 * terms fields appear (see DiscountTermsFields).
 */
export function DiscountForm({
  discount,
  header,
  submitLabel,
  onSubmit,
  onFieldError,
  disabled,
}: DiscountFormProps) {
  const [scheduleMode, setScheduleMode] = useState<"always" | "custom">(
    discount && discount.schedule.length > 0 ? "custom" : "always",
  );
  const [schedule, setSchedule] = useState<WeekSchedule>(() =>
    discount
      ? weekScheduleFromDiscount(discount.schedule)
      : emptyWeekSchedule({ start: "15:00", end: "18:00" }),
  );
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [image, setImage] = useState<Image | null>(discount?.image ?? null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: discount ? valuesFromDiscount(discount) : emptyDiscountForm,
  });

  const kind = useWatch({ control, name: "kind" });
  const isEdit = Boolean(discount);

  const submit = async (values: DiscountFormValues) => {
    setGeneralError(null);
    setScheduleError(null);
    setImageError(null);

    if (scheduleMode === "custom") {
      const message = hasEnabledDay(schedule)
        ? validateWeekSchedule(schedule)
        : "Включите хотя бы один день или выберите «Каждый день, весь день».";
      if (message) {
        setScheduleError(message);
        return;
      }
    }

    try {
      await onSubmit({
        kind: values.kind,
        title: values.title.trim(),
        description: values.description.trim() || null,
        percent_off: values.kind === "percent_off" ? values.percent_off : null,
        status: values.active ? "active" : "paused",
        starts_on: values.starts_on || null,
        ends_on: values.ends_on || null,
        schedule: scheduleMode === "custom" ? weekScheduleToDiscount(schedule) : [],
        image_id: image?.id ?? null,
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        const { raw, text: message } = validationDetail(err);
        const field = matchFormField(raw);
        if (field === "schedule") {
          setScheduleError(message);
          return;
        }
        if (field === "image_id") {
          setImageError(message);
          return;
        }
        if (field === "place_id" && onFieldError?.("place_id", message)) {
          return;
        }
        if (field && field !== "place_id") {
          setError(field, { message });
          return;
        }
      }
      setGeneralError(err);
    }
  };

  return (
    <Paper component="form" sx={{ p: 3, mb: 3 }} onSubmit={handleSubmit(submit)} noValidate>
      <ErrorAlert error={generalError} />

      <Stack spacing={2.5}>
        {header}

        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <TextField
              select
              label="Тип"
              fullWidth
              disabled={disabled || isEdit}
              {...field}
              helperText={
                isEdit ? "Тип нельзя изменить после создания." : DISCOUNT_KINDS[field.value].description
              }
            >
              {DISCOUNT_KIND_VALUES.map((value) => (
                <MenuItem key={value} value={value}>
                  {DISCOUNT_KINDS[value].label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label="Название"
          fullWidth
          disabled={disabled}
          placeholder="Счастливые часы"
          error={!!errors.title}
          helperText={errors.title?.message}
          {...register("title")}
        />

        <DiscountTermsFields kind={kind} control={control} errors={errors} disabled={disabled} />

        <TextField
          label="Описание"
          fullWidth
          multiline
          minRows={2}
          disabled={disabled}
          placeholder="Условия для покупателей, например «Только в зале»"
          error={!!errors.description}
          helperText={errors.description?.message}
          {...register("description")}
        />

        <ImageField
          value={image}
          onChange={setImage}
          disabled={disabled}
          error={imageError}
          helperText="Необязательно. Фото предложения, его увидят покупатели."
        />

        {/* On edit, status has its own Pause/Activate button in the page header. */}
        {!isEdit && (
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    disabled={disabled}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={
                  field.value
                    ? "Активна: покупатели могут ей воспользоваться"
                    : "На паузе: скрыта от покупателей"
                }
              />
            )}
          />
        )}

        <Divider />

        <Typography variant="subtitle2">Срок действия</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            label="С"
            fullWidth
            disabled={disabled}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.starts_on}
            helperText={errors.starts_on?.message ?? "Оставьте пустым, чтобы начать сразу"}
            {...register("starts_on")}
          />
          <TextField
            type="date"
            label="По (включительно)"
            fullWidth
            disabled={disabled}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.ends_on}
            helperText={errors.ends_on?.message ?? "Оставьте пустым для бессрочной скидки"}
            {...register("ends_on")}
          />
        </Stack>

        <Divider />

        <Typography variant="subtitle2">Когда действует?</Typography>
        <RadioGroup
          row
          value={scheduleMode}
          onChange={(event) => setScheduleMode(event.target.value as "always" | "custom")}
        >
          <FormControlLabel
            value="always"
            control={<Radio disabled={disabled} />}
            label="Каждый день, весь день"
          />
          <FormControlLabel
            value="custom"
            control={<Radio disabled={disabled} />}
            label="В определённые дни и часы"
          />
        </RadioGroup>

        {scheduleMode === "custom" ? (
          <WeeklyScheduleEditor
            value={schedule}
            onChange={setSchedule}
            offLabel="Не действует"
            disabled={disabled}
            error={scheduleError}
          />
        ) : (
          scheduleError && (
            <Typography variant="body2" color="error">
              {scheduleError}
            </Typography>
          )
        )}

        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={disabled || isSubmitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

interface DiscountTermsFieldsProps {
  kind: DiscountKind;
  control: Control<DiscountFormValues>;
  errors: FieldErrors<DiscountFormValues>;
  disabled?: boolean;
}

/** The kind-specific inputs. A new kind adds a case here and its rules in discountSchema. */
function DiscountTermsFields({ kind, control, errors, disabled }: DiscountTermsFieldsProps) {
  switch (kind) {
    case "percent_off":
      return (
        <Controller
          control={control}
          name="percent_off"
          render={({ field }) => (
            <TextField
              label="Размер скидки"
              type="number"
              disabled={disabled}
              inputRef={field.ref}
              name={field.name}
              onBlur={field.onBlur}
              value={Number.isFinite(field.value) ? field.value : ""}
              onChange={(event) =>
                field.onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))
              }
              error={!!errors.percent_off}
              helperText={errors.percent_off?.message ?? "Процент от счёта, 1–100"}
              slotProps={{
                htmlInput: { min: 1, max: 100, step: 1 },
                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
              }}
              sx={{ maxWidth: 240 }}
            />
          )}
        />
      );
  }
}
