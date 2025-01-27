import { Suspense } from "react";
import Alert from "react-bootstrap/Alert";
import Loader from "../../components/loader";
import ErrorBoundary from "../../components/error-boundary";
import Info from "./info";

export default function Overview({ className }) {
  return (
    <div className={className}>
      <h1 className="h4 mb-3 text-primary">NCI DNA Methylation Data Hub and Repository</h1>
      <p>
        The NCI Laboratory of Pathology has implemented a novel clinically-reportable assay that uses genome-wide DNA
        methylation profiling as a diagnostic tool for tumors of the central nervous system. The validated tool is
        based, in part, on data published in a recent Nature study (Capper et al., 2018) that showed tumor methylation
        profiles can serve as an important adjunct and help refine morphology-based diagnostics in tumors of the brain
        and spinal cord. Notably, methylation results led to diagnostic revisions in a significant proportion (129 / 139
        or 12% of the entire cohort) of cases. This finding was confirmed in five external centers (50 / 401, 12%), with
        reclassification rates in 6% - 25% of cases.
      </p>
      <p>
        Since its adaptation as an investigative diagnostic tool in 2018, Infinium methylation arrays have led to the
        identification of new CNS tumor types and subtypes, many of which harbor meaningful associations with clinical
        course and outcome. Not infrequently, however, classification results may be non-contributory (suboptimal
        classifier score) or not congruent with the clinical, histopathologic, or molecular features of the case
        (misleading profile). Interpretation can often be improved with visual inspection of unsupervised UMAP or t-SNE
        embedding(s).
      </p>
      <p>
        The NCI Laboratory of Pathology is poised to become a diagnostic reference center to implement this tool for
        diagnostically challenging neuropathology cases. Going forward, it is likely that new methylation-based
        classifiers will emerge for additional tumor types. Areas of future growth include the implementation of
        clinical whole-exome sequencing, gene expression diagnostics (RNA-seq), and a dynamic liquid biopsy program.
      </p>
      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the website administrator if this problem
            persists.
          </Alert>
        }>
        <Suspense fallback={<Loader message="Loading Info" />}>
          <Info />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
