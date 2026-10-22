import { forwardRef, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowDownUp, CalendarDays, CalendarPlus, FilePlus2, Pencil, Phone, Search, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button, EmptyState, ErrorState, LoadingRows, Modal } from '../components/ui';
import { clinicService } from '../services/clinic.service';
import { demoMode } from '../services/api';
import type { ClinicRecord } from '../types';

const baseSchema = z.object({
  name: z.string().optional(),
  detail: z.string().optional(),
  gender: z.string().optional(),
  age: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  patientName: z.string().optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  service: z.string().optional(),
  appointmentDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});
type FormValues = z.infer<typeof baseSchema>;

const labels: Record<string, { singular: string; primary: string; secondary: string }> = {
  '/appointments': { singular: 'Appointment', primary: 'Patient name', secondary: 'Doctor · service · time' },
  '/patients': { singular: 'Patient', primary: 'Patient name', secondary: 'Age · gender · phone' },
  '/doctors': { singular: 'Doctor', primary: 'Doctor name', secondary: 'Specialty · experience' },
  '/queue': { singular: 'Queue entry', primary: 'Patient name', secondary: 'Doctor · service' },
  '/prescriptions': { singular: 'Prescription', primary: 'Patient name', secondary: 'Doctor · diagnosis' },
  '/billing': { singular: 'Invoice', primary: 'Patient name', secondary: 'Invoice number · payment method' },
  '/communications': { singular: 'Message', primary: 'Message title', secondary: 'Channel · recipient' },
  '/reviews': { singular: 'Review', primary: 'Patient name', secondary: 'Rating · feedback' },
  '/campaigns': { singular: 'Campaign', primary: 'Campaign name', secondary: 'Channel · audience' },
  '/analytics': { singular: 'Report', primary: 'Report name', secondary: 'Period · metrics' },
};

const titleActionIcon = (path: string) => path === '/appointments' ? CalendarPlus : path === '/patients' ? UserPlus : FilePlus2;

export function RecordsPage({ path, title, subtitle }: { path: string; title: string; subtitle: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClinicRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ClinicRecord | null>(null);
  const isPatientForm = path === '/patients';
  const isAppointmentForm = path === '/appointments';
  const isDoctorForm = path === '/doctors';
  const isEditing = Boolean(editingRecord);
  const model = labels[path] ?? { singular: 'Record', primary: 'Name', secondary: 'Details' };
  const formSchema = useMemo(() => baseSchema.superRefine((values, context) => {
    if (isDoctorForm) {
      if (!values.name || values.name.trim().length < 2) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter the doctor’s name.', path: ['name'] });
      if (!values.detail || values.detail.trim().length < 2) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Specialization is required.', path: ['detail'] });
      if (!values.phone || !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(values.phone.trim())) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid 10-digit phone number.', path: ['phone'] });
      if (!isEditing && (!values.email || !z.string().email().safeParse(values.email).success)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid email address.', path: ['email'] });
      if (!isEditing && (!values.password || values.password.length < 8)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must be at least 8 characters.', path: ['password'] });
      return;
    }
    if (isAppointmentForm) {
      if (!values.patientName?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a patient name.', path: ['patientName'] });
      if (!values.doctorId) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Select a doctor.', path: ['doctorId'] });
      if (!values.service || values.service.trim().length < 2) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a service.', path: ['service'] });
      if (!values.appointmentDate) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Choose a date.', path: ['appointmentDate'] });
      if (!values.startTime || !values.endTime) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Choose start and end times.', path: ['startTime'] });
      else if (values.endTime <= values.startTime) context.addIssue({ code: z.ZodIssueCode.custom, message: 'End time must be after start time.', path: ['endTime'] });
      return;
    }
    if (!values.name || values.name.trim().length < 2) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter at least 2 characters.', path: ['name'] });
    }
    if (!isPatientForm && (!values.detail || values.detail.trim().length < 2)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Please add a short description.', path: ['detail'] });
      return;
    }
    if (!['MALE', 'FEMALE', 'OTHER'].includes(values.gender ?? '')) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a gender.', path: ['gender'] });
    }
    if (!values.age || !/^\d{1,3}$/.test(values.age) || Number(values.age) < 1 || Number(values.age) > 120) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter an age between 1 and 120.', path: ['age'] });
    }
    if (!values.phone || !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(values.phone.trim())) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid 10-digit phone number.', path: ['phone'] });
    }
  }), [isPatientForm, isDoctorForm, isAppointmentForm, isEditing]);
  const listQuery = useQuery({ queryKey: ['records', path], queryFn: () => clinicService.getRecords(path) });
  const patientOptions = useQuery({ queryKey: ['records', '/patients'], queryFn: () => clinicService.getRecords('/patients'), enabled: isAppointmentForm });
  const doctorOptions = useQuery({ queryKey: ['records', '/doctors'], queryFn: () => clinicService.getRecords('/doctors'), enabled: isAppointmentForm });
  const addMutation = useMutation({
    mutationFn: (values: FormValues) => isEditing && editingRecord
      ? clinicService.updateRecord(path, editingRecord.id, isPatientForm
        ? { name: values.name ?? '', detail: '', age: Number(values.age), gender: values.gender, phone: values.phone }
        : isDoctorForm
          ? { name: values.name ?? '', detail: values.detail ?? '', specialization: values.detail, phone: values.phone }
          : { name: 'Appointment', detail: '', patientId: values.patientId, doctorId: values.doctorId, service: values.service, appointmentDate: values.appointmentDate, startTime: values.startTime, endTime: values.endTime })
      : clinicService.createRecord(path, isPatientForm
      ? {
        name: values.name ?? '',
        detail: `${values.age} yrs · ${values.gender === 'MALE' ? 'Male' : values.gender === 'FEMALE' ? 'Female' : 'Other'} · ${values.phone}`,
        age: Number(values.age),
        gender: values.gender,
        phone: values.phone?.trim(),
      }
      : isDoctorForm
        ? {
          name: values.name ?? '',
          detail: values.detail ?? '',
          specialization: values.detail,
          email: values.email,
          phone: values.phone,
          password: values.password,
        }
        : isAppointmentForm
          ? {
            name: patientOptions.data?.find((patient) => patient.id === values.patientId)?.name ?? 'Appointment',
            detail: `${doctorOptions.data?.find((doctor) => doctor.id === values.doctorId)?.name ?? 'Doctor'} · ${values.service} · ${values.startTime}`,
            patientId: values.patientId,
            doctorId: values.doctorId,
            service: values.service,
            appointmentDate: values.appointmentDate,
            startTime: values.startTime,
            endTime: values.endTime,
          }
      : { name: values.name ?? '', detail: values.detail ?? '' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['records', path] });
      if (path === '/patients' || path === '/doctors') {
        await queryClient.invalidateQueries({ queryKey: ['records', '/appointments'] });
      }
      toast.success(`${model.singular} ${isEditing ? 'updated' : 'added'} successfully`);
      setShowModal(false);
      setEditingRecord(null);
      form.reset();
    },
    onError: (error: Error) => toast.error(error.message || `Unable to create ${model.singular.toLowerCase()}.`),
  });
  const deleteMutation = useMutation({
    mutationFn: (record: ClinicRecord) => clinicService.deleteRecord(path, record.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['records', path] });
      toast.success(`${model.singular} deleted successfully`);
      setDeletingRecord(null);
    },
    onError: (error: Error) => toast.error(error.message || `Unable to delete ${model.singular.toLowerCase()}.`),
  });
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { name: '', detail: '', age: '', gender: '', phone: '', email: '', password: '', patientName: '', patientId: '', doctorId: '', service: '', appointmentDate: '', startTime: '', endTime: '' } });
  const openAdd = () => {
    setEditingRecord(null);
    form.reset();
    setShowModal(true);
  };
  const openEdit = (item: ClinicRecord) => {
    setEditingRecord(item);
    const detailParts = item.detail.split(' · ');
    const gender = item.gender?.toUpperCase() ?? (detailParts[1]?.toUpperCase() === 'MALE' || detailParts[1]?.toUpperCase() === 'FEMALE' ? detailParts[1].toUpperCase() : '');
    const ageFromDetail = detailParts[0]?.match(/^\d+/)?.[0];
    form.reset({
      name: item.name,
      detail: isDoctorForm ? detailParts[0] : item.detail,
      age: item.age ? String(item.age) : ageFromDetail ?? '',
      gender,
      phone: item.phone ?? (isPatientForm ? detailParts.slice(2).join(' · ') : ''),
      email: item.email ?? '',
      patientName: patientOptions.data?.find((patient) => patient.id === item.patientId)?.name ?? (isAppointmentForm ? item.name : ''),
      patientId: item.patientId ?? '',
      doctorId: item.doctorId ?? '',
      service: item.service ?? '',
      appointmentDate: item.appointmentDate ?? '',
      startTime: item.startTime ?? '',
      endTime: item.endTime ?? '',
    });
    setShowModal(true);
  };
  const rows = useMemo(() => (listQuery.data ?? []).filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch = `${item.name} ${item.detail} ${item.status}`.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All statuses' || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [listQuery.data, search, statusFilter]);
  const Icon = titleActionIcon(path);
  const canCreate = ['/appointments', '/patients', '/doctors', '/billing', '/prescriptions'].includes(path);

  return <div className="space-y-5">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Clinic workspace</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink dark:text-white">{title}</h2><p className="mt-1 text-sm text-muted">{subtitle}</p></div>
      {canCreate ? <Button onClick={openAdd}><Icon size={16} /> Add {model.singular}</Button> : <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">Some actions coming soon</span>}
    </header>

    {path === '/queue' && <section className="grid grid-cols-3 gap-3"><QueueMetric label="Now serving" value="08" color="text-teal-700" /><QueueMetric label="Waiting" value={String(listQuery.data?.length ?? 0).padStart(2, '0')} color="text-amber-600" /><QueueMetric label="Completed" value="18" color="text-blue-600" /></section>}
    {path === '/billing' && <section className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Summary label="Today's revenue" value="₹28,450" /><Summary label="Pending payments" value="₹8,200" /><Summary label="Paid invoices" value="18" /><Summary label="Outstanding" value="₹3,600" /></section>}

    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800">
        <div><h3 className="font-bold text-ink dark:text-white">{path === '/appointments' ? "Today's schedule" : `All ${title.toLowerCase()}`}</h3><p className="mt-1 text-xs text-muted">{listQuery.data?.length ?? 0} records</p></div>
        <div className="flex flex-wrap gap-2">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 sm:w-52 sm:flex-none dark:border-slate-700"><Search size={15} className="shrink-0 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder={`Search ${title.toLowerCase()}...`} aria-label={`Search ${title}`} /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><option>All statuses</option>{[...new Set((listQuery.data ?? []).map((item) => item.status))].map((status) => <option key={status}>{status}</option>)}</select>
          <button className="icon-button h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700" aria-label="Sort records" onClick={() => toast.info('Records are sorted by most recent first.')}><ArrowDownUp size={15} /></button>
        </div>
      </div>

      {listQuery.isLoading ? <LoadingRows /> : listQuery.isError ? <ErrorState message={listQuery.error instanceof Error ? listQuery.error.message : 'Unable to load records.'} onRetry={() => { void listQuery.refetch(); }} /> : rows.length === 0 ? <EmptyState title={search ? 'No matching records' : `No ${title.toLowerCase()} yet`} description={search ? 'Try a different search term or status.' : canCreate ? `Add your first ${model.singular.toLowerCase()} to get started.` : 'This view will populate when the relevant service is connected.'} /> : <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-800/70"><tr><th className="px-5 py-3">{model.primary}</th><th className="px-4 py-3">{model.secondary}</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((item) => <RecordRow key={item.id} item={item} path={path} canManage={['/appointments', '/patients', '/doctors'].includes(path)} onEdit={() => openEdit(item)} onDelete={() => setDeletingRecord(item)} />)}</tbody>
        </table>
      </div>}
    </section>

    {demoMode && <p className="text-center text-[11px] text-slate-400">Sample records shown for preview. Demo changes are kept in memory and aren’t sent to your clinic database.</p>}

    {showModal && <Modal title={`${isEditing ? 'Edit' : 'Add'} ${model.singular.toLowerCase()}`} onClose={() => { setShowModal(false); setEditingRecord(null); form.reset(); }} className={isPatientForm ? 'max-w-2xl p-6 sm:p-7' : isAppointmentForm ? 'appointment-modal max-w-3xl p-5 sm:p-7' : ''} titleClassName={isAppointmentForm ? 'text-2xl sm:text-[28px]' : ''}>
      <form className={isAppointmentForm ? 'space-y-6' : 'space-y-5'} onSubmit={form.handleSubmit((values) => {
        if (isAppointmentForm) {
          if (patientOptions.isError) {
            form.setError('patientName', { type: 'validate', message: 'Unable to load patients. Please try again.' });
            return;
          }
          const matchingPatients = (patientOptions.data ?? []).filter((patient) => patient.name.trim().toLowerCase() === values.patientName?.trim().toLowerCase());
          if (matchingPatients.length !== 1) {
            form.setError('patientName', {
              type: 'validate',
              message: matchingPatients.length > 1 ? 'More than one patient has this name. Please contact your clinic administrator.' : 'Enter the exact name of a registered patient.',
            });
            return;
          }
          addMutation.mutate({ ...values, patientId: matchingPatients[0].id });
          return;
        }
        addMutation.mutate(values);
      })} noValidate>
        {isAppointmentForm ? <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <Field label="Patient name" placeholder={patientOptions.isLoading ? 'Loading patients…' : 'Enter name'} error={form.formState.errors.patientName?.message} disabled={patientOptions.isLoading} {...form.register('patientName')} onChange={(event) => form.setValue('patientName', event.target.value, { shouldValidate: true })} />
          <SelectField label="Doctor" placeholder={doctorOptions.isLoading ? 'Loading doctors…' : 'Select doctor'} error={form.formState.errors.doctorId?.message} value={form.watch('doctorId') ?? ''} onChange={(value) => form.setValue('doctorId', value, { shouldValidate: true })} options={(doctorOptions.data ?? []).map((item) => ({ value: item.id, label: `${item.name} · ${item.detail.split(' · ')[0]}` }))} disabled={doctorOptions.isLoading} />
          <Field label="Service" placeholder="e.g. General consultation" error={form.formState.errors.service?.message} {...form.register('service')} onChange={(event) => form.setValue('service', event.target.value, { shouldValidate: true })} />
          <Field label="Date" type="date" min={new Date().toISOString().slice(0, 10)} error={form.formState.errors.appointmentDate?.message} {...form.register('appointmentDate')} onChange={(event) => form.setValue('appointmentDate', event.target.value, { shouldValidate: true })} />
          <Field label="Start time" type="time" error={form.formState.errors.startTime?.message} {...form.register('startTime')} onChange={(event) => form.setValue('startTime', event.target.value, { shouldValidate: true })} />
          <Field label="End time" type="time" error={form.formState.errors.endTime?.message} {...form.register('endTime')} onChange={(event) => form.setValue('endTime', event.target.value, { shouldValidate: true })} />
        </div> : isPatientForm ? <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <Field label="Patient name" placeholder="Enter full name" icon={<UserPlus size={16} />} error={form.formState.errors.name?.message} required {...form.register('name')} onChange={(event) => form.setValue('name', event.target.value, { shouldValidate: true })} />
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Gender <span className="text-rose-500">*</span>
            <span className="relative mt-1.5 block"><UsersRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select aria-label="Gender" aria-required="true" value={form.watch('gender') ?? ''} onChange={(event) => form.setValue('gender', event.target.value, { shouldValidate: true })} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-normal text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </span>{form.formState.errors.gender?.message && <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.gender.message}</span>}
          </label>
          <Field label="Age" type="number" min="1" max="120" inputMode="numeric" placeholder="Age (e.g. 25)" icon={<CalendarDays size={16} />} error={form.formState.errors.age?.message} required {...form.register('age')} onChange={(event) => form.setValue('age', event.target.value, { shouldValidate: true })} />
          <Field label="Phone number" type="tel" inputMode="tel" maxLength={14} placeholder="Enter 10-digit phone number" icon={<Phone size={16} />} error={form.formState.errors.phone?.message} required {...form.register('phone')} onChange={(event) => form.setValue('phone', event.target.value, { shouldValidate: true })} />
        </div> : isDoctorForm ? <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <Field label="Doctor name" placeholder="Enter full name" error={form.formState.errors.name?.message} required {...form.register('name')} onChange={(event) => form.setValue('name', event.target.value, { shouldValidate: true })} />
          <Field label="Specialization" placeholder="e.g. Dermatologist" error={form.formState.errors.detail?.message} required {...form.register('detail')} onChange={(event) => form.setValue('detail', event.target.value, { shouldValidate: true })} />
          {!isEditing && <Field label="Email address" type="email" placeholder="doctor@clinic.com" error={form.formState.errors.email?.message} required {...form.register('email')} onChange={(event) => form.setValue('email', event.target.value, { shouldValidate: true })} />}
          <Field label="Phone number" type="tel" inputMode="tel" placeholder="10-digit phone number" error={form.formState.errors.phone?.message} required {...form.register('phone')} onChange={(event) => form.setValue('phone', event.target.value, { shouldValidate: true })} />
          {!isEditing && <Field label="Temporary password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={form.formState.errors.password?.message} required {...form.register('password')} onChange={(event) => form.setValue('password', event.target.value, { shouldValidate: true })} />}
        </div> : <>
          <Field label={model.primary} placeholder={model.primary} error={form.formState.errors.name?.message} {...form.register('name')} onChange={(event) => form.setValue('name', event.target.value, { shouldValidate: true })} />
          <Field label={model.secondary} placeholder={model.secondary} error={form.formState.errors.detail?.message} {...form.register('detail')} onChange={(event) => form.setValue('detail', event.target.value, { shouldValidate: true })} />
        </>}
        <div className={`flex justify-end gap-2 pt-2 ${isAppointmentForm ? 'gap-3' : ''}`}><Button className={isAppointmentForm ? 'min-h-[60px] rounded-2xl px-6 text-lg' : ''} type="button" variant="outline" onClick={() => { setShowModal(false); setEditingRecord(null); form.reset(); }}>Cancel</Button><Button className={isAppointmentForm ? 'min-h-[60px] rounded-2xl px-6 text-lg' : ''} type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? 'Saving…' : `${isEditing ? 'Update' : 'Save'} ${model.singular}`}</Button></div>
      </form>
    </Modal>}
    {deletingRecord && <Modal title={`Delete ${model.singular.toLowerCase()}?`} onClose={() => setDeletingRecord(null)}><p className="text-sm text-muted">This will permanently delete <strong className="text-ink dark:text-white">{deletingRecord.name}</strong> from this clinic.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setDeletingRecord(null)}>Cancel</Button><Button className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-300" onClick={() => deleteMutation.mutate(deletingRecord)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting…' : 'Delete'}</Button></div></Modal>}
  </div>;
}

const Field = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; icon?: React.ReactNode; required?: boolean; labelClassName?: string }>(
  function Field({ label, error, icon, required, className = '', labelClassName = '', ...props }, ref) {
    return <label className={`block text-sm font-medium text-slate-700 dark:text-slate-200 ${labelClassName}`}>{label}{required && <span className="text-rose-500"> *</span>}
      <span className="relative mt-1.5 block">{icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input ref={ref} aria-required={required} className={`h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 ${icon ? 'pl-10' : 'pl-3'} ${className}`} {...props} />
      </span>{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>;
  },
);

function RecordRow({ item, path, canManage, onEdit, onDelete }: { item: ClinicRecord; path: string; canManage: boolean; onEdit: () => void; onDelete: () => void }) {
  return <tr className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className={`avatar avatar-${item.tone}`}>{item.initials}</span><span className="text-sm font-semibold text-ink dark:text-white">{item.name}</span></div></td><td className="max-w-[260px] truncate px-4 py-3.5 text-xs text-muted">{item.detail}</td><td className="px-4 py-3.5 text-xs text-slate-500">{item.date}</td><td className="px-4 py-3.5"><Status status={item.status} /></td><td className="px-5 py-3.5 text-right">{canManage ? <span className="inline-flex justify-end gap-1"><button className="icon-button h-8 w-8" aria-label={`Edit ${item.name}`} onClick={onEdit}><Pencil size={14} /></button><button className="icon-button h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete ${item.name}`} onClick={onDelete}><Trash2 size={14} /></button></span> : path === '/billing' && item.amount ? <span className="text-xs font-semibold text-ink dark:text-white">₹{item.amount.toLocaleString('en-IN')}</span> : <button className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300" onClick={() => toast.info('Detailed record views are coming soon.')}>View</button>}</td></tr>;
}

function Status({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color = normalized.includes('complete') || normalized.includes('paid') || normalized.includes('active') || normalized.includes('ready') || normalized.includes('published') || normalized.includes('delivered') ? 'badge-green' : normalized.includes('wait') || normalized.includes('pending') || normalized.includes('draft') || normalized.includes('scheduled') ? 'badge-amber' : 'badge-blue';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${color}`}>{status}</span>;
}

function QueueMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="panel flex items-center justify-between p-4"><span className="text-xs text-muted sm:text-sm">{label}</span><strong className={`text-2xl ${color}`}>{value}</strong></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <article className="panel p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-xl font-bold text-ink dark:text-white">{value}</p></article>;
}

function SelectField({ label, placeholder, value, options, onChange, error, disabled = false }: {
  label: string;
  placeholder: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}
    <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
  </label>;
}
