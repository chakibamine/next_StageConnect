import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDownIcon, EyeIcon, MapPinIcon, MailIcon, PhoneIcon, PaletteIcon, LayoutIcon } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Experience } from '@/types/experience';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: number;
  name: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
}

interface CVData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  company: string;
  summary: string;
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  experiences: Experience[];
}

interface CVGeneratorProps {
  data: CVData;
}

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  headerBg?: string;
  sectionBg?: string;
  borderColor?: string;
}

interface Layout {
  name: string;
  description: string;
  style: any;
}

const themes: Theme[] = [
  {
    name: "Professional Blue",
    primary: "#2563eb",
    secondary: "#1e40af",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#e5e7eb",
    headerBg: "#f8fafc",
    sectionBg: "#ffffff",
    borderColor: "#e2e8f0"
  },
  {
    name: "Modern Purple",
    primary: "#7c3aed",
    secondary: "#5b21b6",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#f3f4f6",
    headerBg: "#faf5ff",
    sectionBg: "#ffffff",
    borderColor: "#e9d5ff"
  },
  {
    name: "Minimal Dark",
    primary: "#18181b",
    secondary: "#27272a",
    background: "#ffffff",
    text: "#18181b",
    accent: "#f4f4f5",
    headerBg: "#fafafa",
    sectionBg: "#ffffff",
    borderColor: "#e4e4e7"
  },
  {
    name: "Elegant Green",
    primary: "#059669",
    secondary: "#047857",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#ecfdf5",
    headerBg: "#f0fdf4",
    sectionBg: "#ffffff",
    borderColor: "#d1fae5"
  },
  {
    name: "Warm Orange",
    primary: "#ea580c",
    secondary: "#c2410c",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#fff7ed",
    headerBg: "#ffedd5",
    sectionBg: "#ffffff",
    borderColor: "#fdba74"
  },
  {
    name: "Corporate Gray",
    primary: "#4b5563",
    secondary: "#374151",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#f3f4f6",
    headerBg: "#f9fafb",
    sectionBg: "#ffffff",
    borderColor: "#e5e7eb"
  }
];

const layouts: Layout[] = [
  {
    name: "Standard",
    description: "Traditional CV layout with clear sections",
    style: {
      headerAlignment: "center",
      sectionSpacing: "large",
      skillStyle: "rounded",
      sectionPadding: "normal",
      contentWidth: "full"
    }
  },
  {
    name: "Compact",
    description: "Space-efficient layout with minimal spacing",
    style: {
      headerAlignment: "left",
      sectionSpacing: "small",
      skillStyle: "square",
      sectionPadding: "compact",
      contentWidth: "full"
    }
  },
  {
    name: "Creative",
    description: "Modern layout with accent colors and visual hierarchy",
    style: {
      headerAlignment: "center",
      sectionSpacing: "medium",
      skillStyle: "pill",
      sectionPadding: "normal",
      contentWidth: "full"
    }
  },
  {
    name: "Two Column",
    description: "Split layout with main content and sidebar",
    style: {
      headerAlignment: "center",
      sectionSpacing: "medium",
      skillStyle: "rounded",
      sectionPadding: "normal",
      contentWidth: "split"
    }
  },
  {
    name: "Minimalist",
    description: "Clean and simple layout with focus on content",
    style: {
      headerAlignment: "left",
      sectionSpacing: "medium",
      skillStyle: "minimal",
      sectionPadding: "compact",
      contentWidth: "full"
    }
  }
];

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
  },
  contactItem: {
    marginHorizontal: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  entrySubtitle: {
    fontSize: 11,
    color: '#444',
  },
  entryDate: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  entryDescription: {
    fontSize: 10,
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    backgroundColor: '#f3f4f6',
    padding: '4 8',
    borderRadius: 10,
    margin: 3,
    fontSize: 10,
  },
});

// Helper functions for theme and layout styles
const getThemeStyles = (theme: Theme) => ({
  page: {
    ...styles.page,
    backgroundColor: theme.background,
    color: theme.text,
  },
  header: {
    ...styles.header,
    backgroundColor: theme.headerBg,
    borderBottomColor: theme.borderColor,
  },
  name: {
    ...styles.name,
    color: theme.primary,
  },
  title: {
    ...styles.title,
    color: theme.secondary,
  },
  sectionTitle: {
    ...styles.sectionTitle,
    color: theme.primary,
    borderBottomColor: theme.borderColor,
  },
  section: {
    ...styles.section,
    backgroundColor: theme.sectionBg,
    borderColor: theme.borderColor,
  },
  skill: {
    ...styles.skill,
    backgroundColor: theme.accent,
    color: theme.primary,
    borderColor: theme.borderColor,
  },
  entryTitle: {
    ...styles.entryTitle,
    color: theme.primary,
  },
  entrySubtitle: {
    ...styles.entrySubtitle,
    color: theme.secondary,
  },
  entryDate: {
    ...styles.entryDate,
    color: theme.text,
  },
  entryDescription: {
    ...styles.entryDescription,
    color: theme.text,
  }
});

const getLayoutStyles = (layout: Layout) => {
  const layoutStyle = layout.style;
  return {
    header: {
      ...styles.header,
      textAlign: layoutStyle.headerAlignment,
      padding: layoutStyle.sectionPadding === "compact" ? "10px" : "20px",
    },
    section: {
      ...styles.section,
      marginBottom: layoutStyle.sectionSpacing === "large" ? 20 : layoutStyle.sectionSpacing === "medium" ? 15 : 10,
      padding: layoutStyle.sectionPadding === "compact" ? "10px" : "20px",
      width: layoutStyle.contentWidth === "split" ? "50%" : "100%",
    },
    skill: {
      ...styles.skill,
      borderRadius: layoutStyle.skillStyle === "rounded" ? 10 : 
                   layoutStyle.skillStyle === "pill" ? 20 : 
                   layoutStyle.skillStyle === "minimal" ? 0 : 0,
      padding: layoutStyle.skillStyle === "minimal" ? "2px 4px" : "4px 8px",
    },
    content: {
      display: layoutStyle.contentWidth === "split" ? "flex" : "block",
      flexDirection: "row",
    }
  };
};

// PDF Document Component
const CVDocument = ({ data, theme, layout }: { data: CVData, theme: Theme, layout: Layout }) => {
  const themeStyles = getThemeStyles(theme);
  const layoutStyles = getLayoutStyles(layout);

  return (
    <Document>
      <Page size="A4" style={themeStyles.page}>
        {/* Header */}
        <View style={layoutStyles.header}>
          <Text style={themeStyles.name}>{data.firstName} {data.lastName}</Text>
          <Text style={themeStyles.title}>{data.title}</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>{data.location}</Text>
            <Text style={styles.contactItem}>|</Text>
            <Text style={styles.contactItem}>{data.email}</Text>
            <Text style={styles.contactItem}>|</Text>
            <Text style={styles.contactItem}>{data.phone}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={layoutStyles.section}>
          <Text style={themeStyles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.entryDescription}>{data.summary}</Text>
        </View>

        {/* Experience */}
        <View style={layoutStyles.section}>
          <Text style={themeStyles.sectionTitle}>Work Experience</Text>
          {data.experiences.map((exp) => (
            <View key={exp.id} style={{ marginBottom: 10 }}>
              <Text style={styles.entryTitle}>{exp.title}</Text>
              <Text style={styles.entrySubtitle}>{exp.company}</Text>
              <Text style={styles.entryDate}>{exp.startDate} - {exp.endDate} | {exp.location}</Text>
              <Text style={styles.entryDescription}>{exp.description}</Text>
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={layoutStyles.section}>
          <Text style={themeStyles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={{ marginBottom: 10 }}>
              <Text style={styles.entryTitle}>{edu.degree}</Text>
              <Text style={styles.entrySubtitle}>{edu.institution}</Text>
              <Text style={styles.entryDate}>{edu.startDate} - {edu.endDate}</Text>
              <Text style={styles.entryDescription}>{edu.description}</Text>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={layoutStyles.section}>
          <Text style={themeStyles.sectionTitle}>Certifications</Text>
          {data.certifications.map((cert) => (
            <View key={cert.id} style={{ marginBottom: 5 }}>
              <Text style={styles.entryTitle}>{cert.name}</Text>
              <Text style={styles.entrySubtitle}>{cert.issuer}</Text>
              <Text style={styles.entryDate}>Issued {cert.date} • Credential ID: {cert.credentialId}</Text>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={layoutStyles.section}>
          <Text style={themeStyles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={themeStyles.skill}>{skill.name}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const CVGenerator = ({ data }: CVGeneratorProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [selectedLayout, setSelectedLayout] = useState<Layout>(layouts[0]);

  const getPreviewStyles = () => {
    const theme = selectedTheme;
    const layout = selectedLayout.style;
    
    return {
      container: {
        backgroundColor: theme.background,
        color: theme.text,
      },
      header: {
        backgroundColor: theme.headerBg,
        borderBottom: `1px solid ${theme.borderColor}`,
        textAlign: layout.headerAlignment,
        padding: layout.sectionPadding === "compact" ? "1rem" : "2rem",
      },
      name: {
        color: theme.primary,
        fontSize: "1.875rem",
        fontWeight: "bold",
      },
      title: {
        color: theme.secondary,
        fontSize: "1.125rem",
        marginTop: "0.25rem",
      },
      section: {
        backgroundColor: theme.sectionBg,
        borderBottom: `1px solid ${theme.borderColor}`,
        padding: layout.sectionPadding === "compact" ? "1rem" : "2rem",
        marginBottom: layout.sectionSpacing === "large" ? "2rem" : 
                     layout.sectionSpacing === "medium" ? "1.5rem" : "1rem",
      },
      sectionTitle: {
        color: theme.primary,
        fontSize: "1.25rem",
        fontWeight: "semibold",
        borderBottom: `1px solid ${theme.borderColor}`,
        paddingBottom: "0.5rem",
        marginBottom: "1rem",
      },
      skill: {
        backgroundColor: theme.accent,
        color: theme.primary,
        padding: layout.skillStyle === "minimal" ? "0.125rem 0.25rem" : "0.25rem 0.5rem",
        borderRadius: layout.skillStyle === "rounded" ? "0.5rem" : 
                     layout.skillStyle === "pill" ? "1rem" : "0",
        display: "inline-block",
        margin: "0.25rem",
      },
      content: {
        display: layout.contentWidth === "split" ? "flex" : "block",
        flexDirection: "row",
      }
    };
  };

  const styles = getPreviewStyles();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Curriculum Vitae</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Preview and download your automatically generated CV
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2 mr-4">
              <Label htmlFor="theme" className="flex items-center">
                <PaletteIcon className="h-4 w-4 mr-2" />
                Theme
              </Label>
              <Select
                value={selectedTheme.name}
                onValueChange={(value) => setSelectedTheme(themes.find(t => t.name === value) || themes[0])}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.name} value={theme.name}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mr-4">
              <Label htmlFor="layout" className="flex items-center">
                <LayoutIcon className="h-4 w-4 mr-2" />
                Layout
              </Label>
              <Select
                value={selectedLayout.name}
                onValueChange={(value) => setSelectedLayout(layouts.find(l => l.name === value) || layouts[0])}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  {layouts.map((layout) => (
                    <SelectItem key={layout.name} value={layout.name}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <PDFDownloadLink 
              document={<CVDocument data={data} theme={selectedTheme} layout={selectedLayout} />} 
              fileName={`${data.firstName}_${data.lastName}_CV.pdf`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
            >
              {({ loading }) => 
                loading ? (
                  'Loading...'
                ) : (
                  <>
                    <FileDownIcon className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto" style={styles.container}>
            {/* Header */}
            <div className="text-center mb-8" style={styles.header}>
              <h1 style={styles.name}>{data.firstName} {data.lastName}</h1>
              <p style={styles.title}>{data.title}</p>
              <div className="flex justify-center items-center space-x-4 mt-2 text-sm">
                <span className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {data.location}
                </span>
                <span className="flex items-center">
                  <MailIcon className="h-4 w-4 mr-1" />
                  {data.email}
                </span>
                <span className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {data.phone}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Professional Summary</h2>
              <p>{data.summary}</p>
            </div>

            {/* Experience */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Work Experience</h2>
              <div className="space-y-6">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <h3 style={{ color: selectedTheme.primary }}>{exp.title}</h3>
                    <p style={{ color: selectedTheme.secondary }}>{exp.company}</p>
                    <p className="text-sm">{exp.startDate} - {exp.endDate} | {exp.location}</p>
                    <p className="mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Education</h2>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 style={{ color: selectedTheme.primary }}>{edu.degree}</h3>
                    <p style={{ color: selectedTheme.secondary }}>{edu.institution}</p>
                    <p className="text-sm">{edu.startDate} - {edu.endDate}</p>
                    {edu.description && (
                      <p className="mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Certifications</h2>
              <div className="space-y-4">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 style={{ color: selectedTheme.primary }}>{cert.name}</h3>
                    <p style={{ color: selectedTheme.secondary }}>{cert.issuer}</p>
                    <p className="text-sm">Issued {cert.date} • Credential ID: {cert.credentialId}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    style={styles.skill}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CV Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PDFDownloadLink 
              document={<CVDocument data={data} theme={selectedTheme} layout={selectedLayout} />} 
              fileName={`${data.firstName}_${data.lastName}_CV.pdf`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 mb-4"
            >
              {({ loading }) => 
                loading ? (
                  'Loading document...'
                ) : (
                  <>
                    <FileDownIcon className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
            
            <div className="bg-white rounded-lg shadow-lg p-8" style={styles.container}>
              {/* Same content as in the main view with applied styles */}
              <div className="text-center mb-8" style={styles.header}>
                <h1 style={styles.name}>{data.firstName} {data.lastName}</h1>
                <p style={styles.title}>{data.title}</p>
                <div className="flex justify-center items-center space-x-4 mt-2 text-sm">
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {data.location}
                  </span>
                  <span className="flex items-center">
                    <MailIcon className="h-4 w-4 mr-1" />
                    {data.email}
                  </span>
                  <span className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    {data.phone}
                  </span>
                </div>
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Professional Summary</h2>
                <p>{data.summary}</p>
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Work Experience</h2>
                <div className="space-y-6">
                  {data.experiences.map((exp) => (
                    <div key={exp.id}>
                      <h3 style={{ color: selectedTheme.primary }}>{exp.title}</h3>
                      <p style={{ color: selectedTheme.secondary }}>{exp.company}</p>
                      <p className="text-sm">{exp.startDate} - {exp.endDate} | {exp.location}</p>
                      <p className="mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Education</h2>
                <div className="space-y-6">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 style={{ color: selectedTheme.primary }}>{edu.degree}</h3>
                      <p style={{ color: selectedTheme.secondary }}>{edu.institution}</p>
                      <p className="text-sm">{edu.startDate} - {edu.endDate}</p>
                      {edu.description && (
                        <p className="mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Certifications</h2>
                <div className="space-y-4">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 style={{ color: selectedTheme.primary }}>{cert.name}</h3>
                      <p style={{ color: selectedTheme.secondary }}>{cert.issuer}</p>
                      <p className="text-sm">Issued {cert.date} • Credential ID: {cert.credentialId}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill.id}
                      style={styles.skill}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CVGenerator;
