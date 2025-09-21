import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4">
            <li>Account information (email, password)</li>
            <li>Profile information (name, current role, location, social links)</li>
            <li>Career objectives and goals</li>
            <li>Resume files and related documents</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Generate personalized career recommendations using AI</li>
            <li>Analyze your resume and provide feedback</li>
            <li>Send you updates and marketing communications (with your consent)</li>
            <li>Respond to your comments and questions</li>
            <li>Detect and prevent fraud and abuse</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. AI Processing</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We use Anthropic's Claude AI to process your career information and provide recommendations. Your data is sent to Anthropic's API for processing. Anthropic does not use your data to train their models. Please review Anthropic's privacy policy for more information.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Data Storage and Security</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Your data is stored securely using Supabase, which provides enterprise-grade security. We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4">
            <li>Encryption in transit and at rest</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Regular backups</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Data Sharing and Disclosure</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We do not sell your personal information. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4">
            <li>With your explicit consent</li>
            <li>With service providers (Supabase, Anthropic) who assist in providing our services</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Your Rights (GDPR)</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            If you are in the European Economic Area, you have the following rights:
          </p>
          <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4">
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. Data Retention</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and data at any time through your account settings.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. Cookies and Tracking</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. Children's Privacy</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Our service is not intended for anyone under the age of 18. We do not knowingly collect personal information from children under 18.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">11. Contact Us</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            Email: privacy@traiblix.com<br />
            Data Protection Officer: dpo@traiblix.com
          </p>
        </div>
      </div>
    </div>
  )
}