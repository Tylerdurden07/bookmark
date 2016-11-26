// all mongoose models goes here
module.exports.getBookMarkModel=function(){
  return {
    name: 'string',
    url: 'string'
  }
}

module.exports.getFolderModel=function(bookMarkModel){
  return {
    name: 'string',
    userName: 'string',
    bookMarks: [bookMarkModel]
  }
}
