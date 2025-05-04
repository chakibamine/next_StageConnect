import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { Education, EducationFormData } from '../../types/education';
import { createEducation, updateEducation } from '../../lib/api';

interface EducationFormProps {
  open: boolean;
  onClose: () => void;
  candidateId: number;
  education?: Education | null;
}

const initialFormData: EducationFormData = {
  degree: '',
  institution: '',
  startDate: '',
  endDate: '',
  description: '',
};

const EducationForm: React.FC<EducationFormProps> = ({
  open,
  onClose,
  candidateId,
  education,
}) => {
  const [formData, setFormData] = useState<EducationFormData>(initialFormData);

  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree,
        institution: education.institution,
        startDate: education.startDate,
        endDate: education.endDate,
        description: education.description,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [education]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (education?.id) {
        await updateEducation(candidateId, education.id, formData);
      } else {
        await createEducation(candidateId, formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save education:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{education ? 'Edit Education' : 'Add Education'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="degree"
              label="Degree"
              value={formData.degree}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="institution"
              label="Institution"
              value={formData.institution}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="endDate"
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {education ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EducationForm; 