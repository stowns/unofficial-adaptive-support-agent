export interface VectorSource {
    id: string
    load: () => Promise<void>,
}