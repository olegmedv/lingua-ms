namespace LinguaCMS.Application.Progress.Models;

public class SubmitProgressRequest
{
    public Guid LessonId { get; set; }
    public int Score { get; set; }
}
