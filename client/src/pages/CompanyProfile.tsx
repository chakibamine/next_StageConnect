import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Company {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  logo: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  location: string;
  description: string;
  about?: {
    mission: string;
    history: string;
    responsibility: string;
  };
  socialMedia?: {
    linkedinUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    facebookUrl: string;
    linkedinActive: boolean;
    twitterActive: boolean;
    instagramActive: boolean;
    facebookActive: boolean;
  };
  achievements?: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
  }>;
  projects?: Array<{
    id: number;
    title: string;
    description: string;
    tags: string[];
  }>;
  clients?: Array<{
    id: number;
    name: string;
  }>;
  teamMembers?: Array<{
    id: number;
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
  }>;
  insights?: Array<{
    id: number;
    title: string;
    description: string;
    linkText: string;
  }>;
  posts?: Array<{
    id: number;
    content: string;
    image: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
  }>;
  internships?: Array<{
    id: number;
    title: string;
    department: string;
    location: string;
    workType: string;
    duration: string;
    compensation: string;
    applicants: number;
    status: string;
    posted: string;
    deadline: string;
  }>;
}

const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await axios.get(`/api/companies/${id}`);
      setCompany(response.data);
      setEditedCompany(response.data);
    } catch (err) {
      setError('Failed to fetch company data');
      console.error('Error fetching company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedCompany(company || {});
    setLogoFile(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (logoFile) {
        formData.append('file', logoFile);
      }
      formData.append('data', JSON.stringify(editedCompany));

      const response = await axios.put(`/api/companies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCompany(response.data);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Company profile updated successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update company profile',
        severity: 'error',
      });
      console.error('Error updating company:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company profile?')) {
      try {
        await axios.delete(`/api/companies/${id}`);
        navigate('/companies');
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete company profile',
          severity: 'error',
        });
        console.error('Error deleting company:', err);
      }
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error || 'Company not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Company Profile
          </Typography>
          <Box>
            {editMode ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={company.logo}
                alt={`${company.firstName} ${company.lastName}`}
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              {editMode && (
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mt: 2 }}
                >
                  Upload New Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editMode ? editedCompany.firstName : company.firstName}
                  onChange={(e) => setEditedCompany({ ...editedCompany, firstName: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editMode ? editedCompany.lastName : company.lastName}
                  onChange={(e) => setEditedCompany({ ...editedCompany, lastName: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editMode ? editedCompany.email : company.email}
                  onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  value={editMode ? editedCompany.industry : company.industry}
                  onChange={(e) => setEditedCompany({ ...editedCompany, industry: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Size"
                  value={editMode ? editedCompany.size : company.size}
                  onChange={(e) => setEditedCompany({ ...editedCompany, size: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Founded"
                  value={editMode ? editedCompany.founded : company.founded}
                  onChange={(e) => setEditedCompany({ ...editedCompany, founded: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={editMode ? editedCompany.website : company.website}
                  onChange={(e) => setEditedCompany({ ...editedCompany, website: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editMode ? editedCompany.location : company.location}
                  onChange={(e) => setEditedCompany({ ...editedCompany, location: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={editMode ? editedCompany.description : company.description}
                  onChange={(e) => setEditedCompany({ ...editedCompany, description: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* About Section */}
      {company.about && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            About Us
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Mission
              </Typography>
              <Typography>{company.about.mission}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                History
              </Typography>
              <Typography>{company.about.history}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Corporate Responsibility
              </Typography>
              <Typography>{company.about.responsibility}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Social Media Section */}
      {company.socialMedia && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Social Media
          </Typography>
          <Stack direction="row" spacing={2}>
            {company.socialMedia.linkedinActive && (
              <IconButton
                href={company.socialMedia.linkedinUrl}
                target="_blank"
                color="primary"
              >
                <LinkedInIcon />
              </IconButton>
            )}
            {company.socialMedia.twitterActive && (
              <IconButton
                href={company.socialMedia.twitterUrl}
                target="_blank"
                color="info"
              >
                <TwitterIcon />
              </IconButton>
            )}
            {company.socialMedia.instagramActive && (
              <IconButton
                href={company.socialMedia.instagramUrl}
                target="_blank"
                color="secondary"
              >
                <InstagramIcon />
              </IconButton>
            )}
            {company.socialMedia.facebookActive && (
              <IconButton
                href={company.socialMedia.facebookUrl}
                target="_blank"
                color="primary"
              >
                <FacebookIcon />
              </IconButton>
            )}
          </Stack>
        </Paper>
      )}

      {/* Achievements Section */}
      {company.achievements && company.achievements.length > 0 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Achievements
          </Typography>
          <Grid container spacing={3}>
            {company.achievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {achievement.title}
                    </Typography>
                    <Typography color="textSecondary">
                      {achievement.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Projects Section */}
      {company.projects && company.projects.length > 0 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Projects
          </Typography>
          <Grid container spacing={3}>
            {company.projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography color="textSecondary" paragraph>
                      {project.description}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {project.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Team Members Section */}
      {company.teamMembers && company.teamMembers.length > 0 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Team Members
          </Typography>
          <Grid container spacing={3}>
            {company.teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={member.imageUrl}
                    alt={member.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Internships Section */}
      {company.internships && company.internships.length > 0 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Internships
          </Typography>
          <Grid container spacing={3}>
            {company.internships.map((internship) => (
              <Grid item xs={12} sm={6} md={4} key={internship.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {internship.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {internship.department}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Location: {internship.location}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Work Type: {internship.workType}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Duration: {internship.duration}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Compensation: {internship.compensation}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Applicants: {internship.applicants}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Status: {internship.status}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Posted: {new Date(internship.posted).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Deadline: {new Date(internship.deadline).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanyProfile; 