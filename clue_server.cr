# https://btihen.me/explore/crystal/crystal_web_ssl_server.html
# require "openssl"
require "http/server"

# crystal build -Dpreview_mt --release clue_server.cr
# ./clue_server
#
# window 2a:
# curl "http://localhost:9292/"
#


def elapsed_text(elapsed)
  millis = elapsed.total_milliseconds
  return "#{millis.round(2)}ms" if millis >= 1

  "#{(millis * 1000).round(2)}µs"
end

def mime_type_for(ext)
  case ext
    when ".json"         then "application/json"
    when ".txt"          then "text/plain"
    when ".htm", ".html" then "text/html"
    when ".css"          then "text/css"
    when ".js"           then "application/javascript"
  else                      "application/octet-stream"
  end
end

def ext_for(path)
  File.extname(path)
end

def ext_and_mime_type_for(path)
  ext = ext_for(path)
  return [ext, mime_type_for(ext)]
end

HTMLMime = "text/html"
CSSMime = "text/css"
JSMime = "text/javascript"
ip   = ARGV[0]? ? ARGV[0] : "0.0.0.0"
port = ((ARGV[1]? ? ARGV[1] : "9292").to_i)

# There's a bug in the LogHandler that causes server to crash:
#
# server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new, HTTP::LogHandler.new]) do |context|
#

# server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new, HTTP::StaticFileHandler.new("./public")]) do |context|
server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new]) do |context|
  st = Time.utc
  req = context.request
  res = context.response
  if req.method == "GET"
    file = req.path
    file = file.starts_with?("/") ? file[1..-1] : file
    # 0. req.path: "/setup.html"
    # 1.2. file_path: "./public/setup.html"
    # 1.2a. ...
    # 2. file_path: "/setup.html"
    # puts "0. req.path: #{file.inspect}"
    if file == "clue" || file == ""
      res.content_type = HTMLMime
      file_path = "./public/index.html"
      # puts "1.1 file_path: #{file_path.inspect}"
    else
      file = file.starts_with?("clue/") ? file[5..-1] : file
      file_path = "./public/#{file}"
      # puts "1.2. file_path: #{file_path.inspect}"
      if file && File.exists?(file_path)
        # puts "1.2a. ..."
        _, res.content_type = ext_and_mime_type_for(file_path)
      else
        # puts "1.2b. file: nil..."
        file = nil
      end
    end

    if file
      # file_path = file #"./public/#{file}"
      # puts "2. file_path: #{file_path.inspect}"
      content = File.read(file_path)
      res.output << content
      res.flush
    end
  end
  et = Time.utc
  puts(%Q|#{file.inspect} #{st} INFO - query_server: #{ip} - #{req.method} #{req.resource} #{req.version} - #{res.status_code} (#{elapsed_text(et - st)})|)

  next
end

## configure the ssl service
#tls_config = OpenSSL::SSL::Context::Server.new
#tls_config.private_key = "./server.key"
#tls_config.certificate_chain = "./server.crt"
#
## 'bind' the ssl server to the web server
#server.bind_tls ip, port, tls_config
#puts "Listening on https://#{ip}:#{port}"
#server.listen

puts "Listening on http://#{ip}:#{port}"
server.listen(ip, port)
