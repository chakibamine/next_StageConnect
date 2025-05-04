import React, { useEffect, useState } from 'react';
import { Education } from '../../types/education';
import { getEducationList, deleteEducation } from '../../lib/api';
import EducationForm from './EducationForm';
import { Button, List, ListItem, Typography, IconButton, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface EducationListProps {
  candidateId: number;
}

const EducationList: React.FC<EducationListProps> = ({ candidateId }) => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

  const fetchEducations = async () => {
    try {
      const data = await getEducationList(candidateId);
      setEducations(data);
    } catch (error) {
      console.error('Failed to fetch educations:', error);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, [candidateId]);

  const handleEdit = (education: Education) => {
    setSelectedEducation(education);
    setIsFormOpen(true);
  };

  const handleDelete = async (educationId: number) => {
    try {
      await deleteEducation(candidateId, educationId);
      fetchEducations();
    } catch (error) {
      console.error('Failed to delete education:', error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEducation(null);
    fetchEducations();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Education</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsFormOpen(true)}>
          Add Education
        </Button>
      </Box>

      <List>
        {educations.map((education) => (
          <ListItem
            key={education.id}
            sx={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              mb: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {education.degree} at {education.institution}
              </Typography>
              <Box>
                <IconButton size="small" onClick={() => handleEdit(education)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(education.id!)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {education.startDate} - {education.endDate}
            </Typography>
            <Typography variant="body2">{education.description}</Typography>
          </ListItem>
        ))}
      </List>

      <EducationForm
        open={isFormOpen}
        onClose={handleFormClose}
        candidateId={candidateId}
        education={selectedEducation}
      />
    </Box>
  );
};

export default EducationList; 