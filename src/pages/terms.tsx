import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
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

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            By accessing or using Traiblix, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Use License</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Permission is granted to temporarily use Traiblix for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. User Accounts</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding your password and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. AI Services</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Traiblix uses artificial intelligence to provide career recommendations and resume analysis. While we strive for accuracy, AI-generated content should be used as guidance only and not as professional career advice. Users should verify all information and make their own informed decisions.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. User Content</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            You retain all rights to any content you submit, post, or display on or through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and process your content solely for providing the Service.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Privacy and Data Protection</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Your use of Traiblix is also governed by our Privacy Policy. We are committed to protecting your personal information and complying with applicable data protection laws, including GDPR.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. Termination</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            In no event shall Traiblix or its suppliers be liable for any damages arising out of the use or inability to use the service, even if we have been notified of the possibility of such damages.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. Changes to Terms</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">10. Contact Information</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            If you have any questions about these Terms, please contact us at support@traiblix.com
          </p>
        </div>
      </div>
    </div>
  )
}