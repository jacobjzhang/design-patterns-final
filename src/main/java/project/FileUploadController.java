package project;

import project.storage.StorageFileNotFoundException;
import project.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// import org.apache.http.HttpEntity;
// import org.apache.http.HttpResponse;
// import org.apache.http.client.HttpClient;
// import org.apache.http.client.methods.HttpPost;
// import org.apache.http.entity.StringEntity;

import org.jbibtex.BibTeXDatabase;
import org.jbibtex.BibTeXEntry;
import org.jbibtex.BibTeXParser;
import org.jbibtex.Key;
import org.jbibtex.ParseException;
import org.jbibtex.TokenMgrException;
import org.jbibtex.Value;
import org.jbibtex.StringValue;

// For file reading
import java.io.Reader;
// import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

import java.io.IOException;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.List;
import java.util.Map.Entry;

import java.util.Collection;


@Controller
public class FileUploadController {

    private final StorageService storageService;

    @Autowired
    public FileUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/")
    public String index() {
        return "index.html";
    }

    @GetMapping("/uploadfile")
    public String listUploadedFiles(Model model) throws IOException {

        model.addAttribute("files", storageService
                .loadAll()
                .map(path ->
                        MvcUriComponentsBuilder
                                .fromMethodName(FileUploadController.class, "serveFile", path.getFileName().toString())
                                .build().toString())
                .collect(Collectors.toList()));

        return "uploadForm.html";
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {

        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getFilename()+"\"")
                .body(file);
    }

    // Utility which converts CSV to ArrayList using Split Operation
  	public static ArrayList<String> crunchifyCSVtoArrayList(String crunchifyCSV) {
  		ArrayList<String> crunchifyResult = new ArrayList<String>();

  		if (crunchifyCSV != null) {
  			String[] splitData = crunchifyCSV.split("\\s*,\\s*");
  			for (int i = 0; i < splitData.length; i++) {
  				if (!(splitData[i] == null) || !(splitData[i].length() == 0)) {
  					crunchifyResult.add(splitData[i].trim());
  				}
  			}
  		}

  		return crunchifyResult;
  	}

    @PostMapping("/uploadfile")
    public String handleFileUpload(@RequestParam("file") MultipartFile file,
                                   RedirectAttributes redirectAttributes) {

        storageService.store(file);
        redirectAttributes.addFlashAttribute("message",
                "You successfully uploaded " + file.getOriginalFilename() + "!");


        System.out.println("redirect:/parsecsv/" + file.getOriginalFilename());
        return "redirect:/parsecsv/" + file.getOriginalFilename();
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }

}
