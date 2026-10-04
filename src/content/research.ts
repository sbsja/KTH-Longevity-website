import type { ResearchItem } from "./types";

/**
 * Curated from the members' weekly reading notes (Research/v.4 to v.12, early 2025).
 * Every entry was checked against publisher or Europe PMC metadata on 3 October 2026
 * for title, venue, year and article type. Summaries are ours; findings belong to the
 * authors. Institutional proxy links from the notes were replaced with public DOIs.
 */
export const researchIntro = {
  title: "Reading notes on ageing science",
  lede: "Members of the association keep a running list of papers worth talking about. These are the ones from early 2025 that held up to a second look, with the kind of study each one is and what it can and cannot tell us.",
  note: "This is a reading list, not medical advice. Several findings come from mice, worms or cells, and none of them supports a treatment for people.",
};

export const researchTopics = [
  "Environment and lifestyle",
  "Measuring ageing",
  "Telomeres",
  "Immune ageing",
  "Cells and molecules",
  "Drug discovery",
] as const;

export type ResearchTopic = (typeof researchTopics)[number];

export const research: (ResearchItem & { topic: ResearchTopic })[] = [
  {
    id: "exposome-vs-genome",
    topic: "Environment and lifestyle",
    title: "Integrating the environmental and genetic architectures of aging and mortality",
    journal: "Nature Medicine",
    year: 2025,
    studyType: "Human cohort study",
    summary:
      "An exposome-wide analysis of UK Biobank data (about half a million participants) identified 25 independent environmental exposures associated with mortality and with proteomic measures of ageing, among them smoking, physical activity, living conditions and socioeconomic factors. In this cohort the measured environment explained substantially more of the variation in mortality than polygenic risk scores did, although genetics mattered more for dementia and some cancers.",
    caveat: "Observational associations in one UK cohort; exposures were largely self-reported or measured once.",
    doi: "10.1038/s41591-024-03483-9",
    url: "https://doi.org/10.1038/s41591-024-03483-9",
    sources: [{ path: "Research/v.8.docx" }],
  },
  {
    id: "diet-macronutrients-ageing",
    topic: "Environment and lifestyle",
    title: "Multi-dimensional evidence from the UK Biobank shows the impact of diet and macronutrient intake on aging",
    journal: "Communications Medicine",
    year: 2025,
    studyType: "Human cohort study",
    summary:
      "Using 24-hour dietary assessments from UK Biobank participants, the authors related dietary patterns and macronutrient intake to markers of biological ageing such as phenotypic age, telomere length and brain volume. Healthier, more plant-based and carbohydrate-rich patterns were associated with more favourable ageing markers, and Mendelian randomisation analyses pointed in the same direction for carbohydrate intake.",
    caveat: "Self-reported diet in a UK cohort; the estimated effects were small and may not generalise to other populations.",
    doi: "10.1038/s43856-025-00754-5",
    url: "https://doi.org/10.1038/s43856-025-00754-5",
    sources: [{ path: "Research/v.6.docx" }],
  },
  {
    id: "teeth-centenarians",
    topic: "Environment and lifestyle",
    title: "Edentulousness and the likelihood of becoming a centenarian: longitudinal observational study",
    journal: "JMIR Aging",
    year: 2025,
    studyType: "Human observational study",
    summary:
      "In a longitudinal study following 4,239 Chinese adults aged 80 to 100, people who still had natural teeth were more likely to reach their hundredth birthday than people who had lost all of them.",
    caveat: "Association only. Keeping one's teeth may be a marker of general health and access to care rather than a cause of long life.",
    doi: "10.2196/68444",
    url: "https://doi.org/10.2196/68444",
    sources: [{ path: "Research/v.12.docx" }],
  },
  {
    id: "infection-transcriptomic-clock",
    topic: "Measuring ageing",
    title: "Human peripheral blood leukocyte transcriptome-based aging clock reveals acceleration of aging by bacterial or viral infections",
    journal: "The Journals of Gerontology: Series A",
    year: 2025,
    studyType: "Human observational study",
    summary:
      "The authors built an ageing clock from whole-transcriptome sequencing of blood leukocytes in healthy adults and applied it to public datasets including 1,558 patients with infectious diseases. Patients with bacterial or viral infections showed an accelerated transcriptomic age, which the authors link to inflammation and oxidative stress.",
    caveat: "Small training set (35 healthy adults) and cross-sectional comparisons, so it cannot show whether the acceleration persists after recovery.",
    doi: "10.1093/gerona/glaf054",
    url: "https://doi.org/10.1093/gerona/glaf054",
    sources: [{ path: "Research/v.12.docx" }],
  },
  {
    id: "somatic-mutations-epigenetic-clocks",
    topic: "Measuring ageing",
    title: "Interplay of somatic mutations and epigenetic aging clocks",
    journal: "Nature Aging (News & Views)",
    year: 2025,
    studyType: "Preview article",
    summary:
      "A News & Views commentary on an analysis by Koch and colleagues showing that two seemingly separate hallmarks of ageing interact: somatic mutations acquired over a lifetime alter DNA methylation at nearby sites and therefore shift epigenetic age estimates. Clocks built on mutations and clocks built on methylation turn out to be closely related.",
    caveat: "A commentary rather than primary data. The underlying analysis is Koch et al., Nature Aging, 2025.",
    doi: "10.1038/s43587-025-00846-w",
    url: "https://doi.org/10.1038/s43587-025-00846-w",
    sources: [{ path: "Research/v.12.docx" }],
  },
  {
    id: "erythrocytes-longevity",
    topic: "Measuring ageing",
    title: "Longevity humans have youthful erythrocyte function and metabolic signatures",
    journal: "Aging Cell",
    year: 2025,
    studyType: "Human observational study",
    summary:
      "People living well beyond ninety had red blood cells whose metabolism and ability to release oxygen resembled those of much younger adults, with distinctive metabolite signatures involving adenosine, sphingosine-1-phosphate and glutathione-related compounds.",
    caveat: "A comparison between groups; it shows association, not that youthful red cells cause a long life.",
    doi: "10.1111/acel.14482",
    url: "https://doi.org/10.1111/acel.14482",
    sources: [{ path: "Research/v.7_.docx" }],
  },
  {
    id: "tert-knock-in-mice",
    topic: "Telomeres",
    title: "Telomerase reverse transcriptase gene knock-in unleashes enhanced longevity and accelerated damage repair in mice",
    journal: "Aging Cell",
    year: 2025,
    studyType: "Mouse study",
    summary:
      "Mice engineered with an additional copy of the telomerase gene lived longer across several generations, healed wounds faster and resisted intestinal inflammation, without an increase in cancer in the study.",
    caveat: "Mice have much longer telomeres and different telomere biology than humans. No human intervention follows from this.",
    doi: "10.1111/acel.14445",
    url: "https://doi.org/10.1111/acel.14445",
    sources: [{ path: "Research/v.5 (inget nytt, men äldre super-studie).docx" }],
  },
  {
    id: "humanised-telomere-mice",
    topic: "Telomeres",
    title: "Modification of the telomerase gene with human regulatory sequences resets mouse telomeres to human length",
    journal: "Nature Communications",
    year: 2025,
    studyType: "Mouse study",
    summary:
      "By giving the mouse telomerase gene human regulatory sequences, the authors produced mice whose telomeres are human-length (around 10 to 12 kb instead of roughly 50 kb) and which still develop normally. The result is a tool: a mouse model that may represent human telomere biology better in studies of ageing and cancer.",
    caveat: "A new research model, not a treatment.",
    doi: "10.1038/s41467-025-56559-6",
    url: "https://doi.org/10.1038/s41467-025-56559-6",
    sources: [{ path: "Research/v.6.docx" }],
  },
  {
    id: "fgf21-thymus",
    topic: "Immune ageing",
    title: "Enhanced paracrine action of FGF21 in stromal cells delays thymic aging",
    journal: "Nature Aging",
    year: 2025,
    studyType: "Mouse study",
    summary:
      "The thymus, where T cells mature, shrinks with age. Raising the hormone FGF21 in the thymus's stromal cells protected aged mice against this deterioration and preserved the production of naïve T cells, improving measures of immune function.",
    caveat: "Genetically engineered mice; relevance to human immune ageing is untested.",
    doi: "10.1038/s43587-025-00813-5",
    url: "https://doi.org/10.1038/s43587-025-00813-5",
    sources: [{ path: "Research/v.8.docx" }],
  },
  {
    id: "waves-of-aging",
    topic: "Immune ageing",
    title: "Everything everywhere all at once: unraveling the waves of aging",
    journal: "Immunity (Preview)",
    year: 2025,
    studyType: "Preview article",
    summary:
      "A preview of a single-cell atlas spanning thirteen mouse organs that describes ageing not as one gradual slope but as four successive waves of change in cell populations, with immune cells, especially lymphocytes, changing the most.",
    caveat: "Mouse data, summarised second-hand: the preview discusses another group's atlas study.",
    doi: "10.1016/j.immuni.2025.01.015",
    url: "https://doi.org/10.1016/j.immuni.2025.01.015",
    sources: [{ path: "Research/v.7_.docx" }],
  },
  {
    id: "ap2a1-senescence",
    topic: "Cells and molecules",
    title: "AP2A1 modulates cell states between senescence and rejuvenation",
    journal: "Cellular Signalling",
    year: 2025,
    studyType: "Cell study",
    summary:
      "In cultured human fibroblasts, the protein AP2A1 was more abundant in senescent cells and, together with integrin β1, reinforced the cells' adhesion to their surroundings. Lowering or raising AP2A1 shifted cells between senescent-like and more youthful states in the dish.",
    caveat: "Cell culture only.",
    doi: "10.1016/j.cellsig.2025.111616",
    url: "https://doi.org/10.1016/j.cellsig.2025.111616",
    sources: [{ path: "Research/v.4.docx" }],
  },
  {
    id: "mtorc1-splicing",
    topic: "Cells and molecules",
    title: "Splice age: mTORC1-mediated RNA splicing in metabolism and ageing",
    journal: "Trends in Cell Biology",
    year: 2025,
    studyType: "Review",
    summary:
      "A short review of evidence that mTORC1, the nutrient-sensing complex that rapamycin inhibits, influences ageing in model organisms partly through factors that control RNA splicing.",
    caveat: "A review of other studies, mostly in model organisms.",
    doi: "10.1016/j.tcb.2025.01.001",
    url: "https://doi.org/10.1016/j.tcb.2025.01.001",
    sources: [{ path: "Research/v.4.docx" }],
  },
  {
    id: "toxicology-data-longevity",
    topic: "Drug discovery",
    title: "Repurposing regulatory toxicology safety data to identify potential pro-longevity substances",
    journal: "bioRxiv",
    year: 2025,
    studyType: "Preprint, not peer reviewed",
    summary:
      "The authors mined regulatory pesticide safety studies, which include long rodent survival experiments, for substances associated with longer survival, and followed up candidates in worms. Several of the candidates act on mitochondrial energy production.",
    caveat: "Not peer reviewed at the time of reading; rodent and worm data only. Nothing here is a reason to ingest anything.",
    doi: "10.1101/2025.01.30.635304",
    url: "https://doi.org/10.1101/2025.01.30.635304",
    sources: [{ path: "Research/v.6.docx" }],
  },
];

export function researchByTopic(): { topic: ResearchTopic; items: ResearchItem[] }[] {
  return researchTopics
    .map((topic) => ({ topic, items: research.filter((r) => r.topic === topic) }))
    .filter((g) => g.items.length > 0);
}
