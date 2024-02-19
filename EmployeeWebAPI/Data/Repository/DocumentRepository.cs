using Microsoft.EntityFrameworkCore;

namespace EmployeeWebAPI.Data.Repository
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly EmployeeDBContext _context;

        public DocumentRepository(EmployeeDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsByEmployeeIdAsync(int employeeId)
        {
            return await _context.Documents.Where(d => d.EmployeeId == employeeId).ToListAsync();
        }

        public async Task<Document> GetDocumentByIdAsync(int documentId)
        {
            return await _context.Documents.FindAsync(documentId);
        }

        public async Task<Document> AddDocumentAsync(Document document)
        {
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();
            return document;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task DeleteDocumentAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document != null)
            {
                _context.Documents.Remove(document);
                await _context.SaveChangesAsync();
            }
        }
    }
}
