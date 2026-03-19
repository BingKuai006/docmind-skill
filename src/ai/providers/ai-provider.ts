import { FileInfo } from '../../scanner/project-scanner';

export interface AIAnalysisResult {
  purpose: string;
  enhancedPurpose?: string;
  functions: Array<{ name: string; description?: string }>;
  dependencies: string[];
  description?: string;
  complexity: 'simple' | 'medium' | 'complex';
  confidence?: number;
  analysisMethod: 'rule' | 'local-ai' | 'cloud-ai';
}

export interface AIProvider {
  readonly name: string;
  analyzeFile(filePath: string, content: string): Promise<AIAnalysisResult>;
  isAvailable(): Promise<boolean>;
}

export interface AnalysisStrategy {
  analyze(file: FileInfo, content: string): Promise<AIAnalysisResult>;
}
