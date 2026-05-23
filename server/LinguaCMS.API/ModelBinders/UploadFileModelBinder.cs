using LinguaCMS.Application.Files.Commands.UploadFile;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace LinguaCMS.API.ModelBinders;

public class UploadFileModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        ArgumentNullException.ThrowIfNull(bindingContext);

        var file = bindingContext.HttpContext.Request.Form.Files.FirstOrDefault();
        if (file is null)
        {
            bindingContext.Result = ModelBindingResult.Failed();
            return Task.CompletedTask;
        }

        var command = new UploadFileCommand(file.OpenReadStream(), file.FileName, file.Length);
        bindingContext.Result = ModelBindingResult.Success(command);
        return Task.CompletedTask;
    }
}
