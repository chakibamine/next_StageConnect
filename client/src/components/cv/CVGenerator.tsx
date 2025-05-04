import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDownIcon, EyeIcon, MapPinIcon, MailIcon, PhoneIcon } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Experience } from '@/types/experience';

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

// PDF Document Component
const CVDocument = ({ data }: { data: CVData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.firstName} {data.lastName}</Text>
        <Text style={styles.title}>{data.title}</Text>
        <View style={styles.contactInfo}>
          <Text style={styles.contactItem}>{data.location}</Text>
          <Text style={styles.contactItem}>|</Text>
          <Text style={styles.contactItem}>{data.email}</Text>
          <Text style={styles.contactItem}>|</Text>
          <Text style={styles.contactItem}>{data.phone}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.entryDescription}>{data.summary}</Text>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {data.certifications.map((cert) => (
          <View key={cert.id} style={{ marginBottom: 5 }}>
            <Text style={styles.entryTitle}>{cert.name}</Text>
            <Text style={styles.entrySubtitle}>{cert.issuer}</Text>
            <Text style={styles.entryDate}>Issued {cert.date} • Credential ID: {cert.credentialId}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {data.skills.map((skill) => (
            <Text key={skill.id} style={styles.skill}>{skill.name}</Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

const CVGenerator = ({ data }: CVGeneratorProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

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
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <PDFDownloadLink 
              document={<CVDocument data={data} />} 
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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{data.firstName} {data.lastName}</h1>
              <p className="text-lg text-gray-600 mt-1">{data.title}</p>
              <div className="flex justify-center items-center space-x-4 mt-2 text-sm text-gray-500">
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
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Professional Summary</h2>
              <p className="text-gray-700">{data.summary}</p>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Work Experience</h2>
              <div className="space-y-6">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <h3 className="text-lg font-medium text-gray-900">{exp.title}</h3>
                    <p className="text-primary-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate} | {exp.location}</p>
                    <p className="mt-2 text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Education</h2>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-primary-600 font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                    {edu.description && (
                      <p className="mt-2 text-gray-700">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Certifications</h2>
              <div className="space-y-4">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="text-lg font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-primary-600 font-medium">{cert.issuer}</p>
                    <p className="text-sm text-gray-500">Issued {cert.date} • Credential ID: {cert.credentialId}</p>
                  </div>
                ))}
              </div>
              </div>

            {/* Skills */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
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
              document={<CVDocument data={data} />} 
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
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Same content as in the main view */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{data.firstName} {data.lastName}</h1>
                <p className="text-lg text-gray-600 mt-1">{data.title}</p>
                <div className="flex justify-center items-center space-x-4 mt-2 text-sm text-gray-500">
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

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Professional Summary</h2>
                <p className="text-gray-700">{data.summary}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Work Experience</h2>
                <div className="space-y-6">
                  {data.experiences.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="text-lg font-medium text-gray-900">{exp.title}</h3>
                      <p className="text-primary-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate} | {exp.location}</p>
                      <p className="mt-2 text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
                </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Education</h2>
                <div className="space-y-6">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-primary-600 font-medium">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                      {edu.description && (
                        <p className="mt-2 text-gray-700">{edu.description}</p>
                      )}
                </div>
                  ))}
                </div>
            </div>
            
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Certifications</h2>
                <div className="space-y-4">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="text-lg font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-primary-600 font-medium">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">Issued {cert.date} • Credential ID: {cert.credentialId}</p>
                  </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b">Skills</h2>
            <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
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
