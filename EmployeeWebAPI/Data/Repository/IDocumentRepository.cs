namespace EmployeeWebAPI.Data.Repository
{
    public interface IDocumentRepository
    {
        Task<IEnumerable<Document>> GetAllDocumentsByEmployeeIdAsync(int employeeId);
        Task<Document> GetDocumentByIdAsync(int documentId);
        Task<Document> AddDocumentAsync(Document document);
        Task<Document> UpdateDocumentAsync(Document document);
        Task DeleteDocumentAsync(int documentId);
    }
}
